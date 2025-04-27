import React, { useState, useEffect, useRef } from 'react';
import ConversationTab from './ConversationTab';
import { useWebSocket } from '../contexts/WebSocketContext';
import Notification from './Notification';
import { truncateHTML } from '../utils/messageUtils';
import { FaComment, FaSearch } from 'react-icons/fa';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function MessageCenter() {
  const [conversations, setConversations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [searchResults, setSearchResults] = useState({ conversations: [], newUsers: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = useRef(null);
  
  const { 
    socket, 
    currentUserId, 
    unreadCount,
    unreadConversations, 
    loadUnreadConversations 
  } = useWebSocket();
  
  useEffect(() => {
    if (socket) {
      // Listen for conversation creation
      const conversationCreatedHandler = (response) => {
        console.log('Conversation created response:', response);
        if (response.success) {
          // Create conversation tab with data from socket response
          setConversations(prev => {
            // Check if this conversation already exists
            const exists = prev.some(conv => conv.conversation_id === response.conversation_id);
            if (!exists) {
              return [...prev, response];
            }
            return prev;
          });
        } else {
          showNotification('Failed to load conversation', 'error');
        }
      };
      
      // Listen for search results
      const searchResultsHandler = (response) => {
        console.log('Search results received:', response);
        if (response.success) {
          setSearchResults({
            conversations: response.conversations || [],
            newUsers: response.newUsers || []
          });
        } else {
          showNotification('Failed to search users', 'error');
        }
      };
      
      socket.on('conversation_created', conversationCreatedHandler);
      socket.on('search_results', searchResultsHandler);
      
      return () => {
        socket.off('conversation_created', conversationCreatedHandler);
        socket.off('search_results', searchResultsHandler);
      };
    }
  }, [socket]);
  
  const handleSearch = (e) => {
    const query = e.target.value.trim();
    setSearchTerm(query);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Only search if query is at least 3 characters
    if (query.length >= 3) {
      // Debounce the search request
      searchTimeout.current = setTimeout(() => {
        if (socket && currentUserId) {
          console.log('Sending search request: ', query, 'by: ', currentUserId);
          socket.emit('search_users', {
            user_id: currentUserId,
            search_term: query
          });
        }
      }, 300);
    } else if (query.length === 0) {
      // If search field is cleared, reset to unread conversations
      loadUnreadConversations();
    }
  };
  
  const openMessagingPopup = (userId, username, userPhoto) => {
    if (socket && currentUserId) {
      socket.emit('get_conversation', {
        current_user_id: currentUserId,
        recipient_id: userId,
        recipient_username: username,
        recipient_photo: userPhoto
      });
    }
  };
  
  const closeConversation = (conversationId) => {
    setConversations(prev => 
      prev.filter(conv => conv.conversation_id !== conversationId)
    );
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      loadUnreadConversations();
      setSearchTerm('');
      setSearchResults({ conversations: [], newUsers: [] });
    }
  };
  
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };
  
  // Configuration options for OverlayScrollbars
  const scrollOptions = {
    scrollbars: {
      autoHide: "leave",
      theme: "os-theme-light"
    },
    // Disable horizontal scrolling
    overflow: {
      x: "hidden",
      y: "scroll"
    }
  };
  
  // Style for the scrollable container
  const scrollContainerStyle = {
    height: "550px"
  };
  
  // Get displayed users (from search or unread conversations)
  const displayedConversations = searchTerm.length >= 3 
    ? searchResults.conversations 
    : unreadConversations;
    
  const displayedNewUsers = searchTerm.length >= 3 
    ? searchResults.newUsers 
    : [];
  
  return (
    <div className="message-center">
        <div className="messages-container">  
          <div className="message-dropdown-wrapper">   
            <div className={`conversations-btn`} onClick={toggleDropdown}>
              <img
                className="avatar"
                src="https://satya.pl/serve_image.php?photo=Lukrecja_bae1734781188.png"
                alt="User avatar"
              />
              {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'No unread messages'}
            </div> 
            {showDropdown && (
              <div className="message-dropdown show-message-dropdown">
                <div className="unread-messages">
                  <div className="search-user">
                    <div className="search-user-inner">
                      <input
                        type="text"
                        className="user-search"
                        id="user-search"
                        placeholder="Search username or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                      <FaSearch className="search-icon" />
                    </div>
                    <div id="search-results" className="search-results"></div>
                  </div>
                  
                  <OverlayScrollbarsComponent 
                    className="unread-inner-div" 
                    id="unread-conversations"
                    options={scrollOptions}
                    style={scrollContainerStyle}
                  >
                    {/* Display conversations from search results or unread conversations */}
                    {displayedConversations.map((conversation) => {
                      let lastMessage = conversation.last_message || "No messages yet";
                      lastMessage = truncateHTML(lastMessage, 30);
                      
                      const photoUrl = conversation.last_sender_photo ? 
                        (conversation.last_sender_photo.startsWith("https://") 
                          ? conversation.last_sender_photo 
                          : `https://satya.pl/serve_image.php?photo=${conversation.last_sender_photo}`)
                        : (conversation.photo && conversation.photo.startsWith("https://")
                          ? conversation.photo
                          : `https://satya.pl/serve_image.php?photo=${conversation.photo || 'default.jpg'}`);
                      
                      const userId = conversation.last_sender_id || conversation.user_id;
                      const username = conversation.last_sender_username || conversation.username;
                      const userPhoto = conversation.last_sender_photo || conversation.photo;
                      
                      return (
                        <div 
                          key={`conv-${userId}-${conversation.conversation_id || Date.now()}`}
                          className="unread-message conversation-item conversation-listener"
                          data-user-id={userId}
                          data-user-photo={userPhoto}
                          onClick={() => openMessagingPopup(
                            userId, 
                            username, 
                            userPhoto
                          )}
                        >
                          <div className='msg-col-1'>
                            <div className='msg-photo'>
                              <img 
                                src={photoUrl}
                                alt={username}
                              />
                            </div>
                          </div>
                          <div className='msg-col-right'>
                            <div className="msg-content">
                              <div className="conversation-username">{username}</div> 
                              <div className="last-message" 
                                dangerouslySetInnerHTML={{ __html: lastMessage }}></div>
                            </div>
                            {conversation.unread_count > 0 && (
                              <span className="unread-count">{conversation.unread_count}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Display new users from search */}
                    {displayedNewUsers.map((user) => (
                      <div 
                        key={`new-${user.user_id}`}
                        className="unread-message conversation-item conversation-listener"
                        data-user-id={user.user_id}
                        data-user-photo={user.photo}
                        onClick={() => openMessagingPopup(
                          user.user_id, 
                          user.username, 
                          user.photo
                        )}
                      >
                        <div className='msg-col-1'>
                          <div className='msg-photo'>
                            <img 
                              src={user.photo.startsWith("https://") 
                                ? user.photo 
                                : `https://satya.pl/serve_image.php?photo=${user.photo || 'default.jpg'}`}
                              alt={user.username}
                            />
                          </div>
                        </div>
                        <div className='msg-col-right'>
                          <div className="msg-content">
                            <div className="conversation-username">{user.username}</div> 
                            <div className="last-message">No conversation yet</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </OverlayScrollbarsComponent>
                </div>      
              </div>
            )}
          </div>
          {showDropdown && (
            <div className="messaging-popup-wrapper">
              {conversations.map(conv => (
                <ConversationTab
                  key={conv.conversation_id}
                  conversationId={conv.conversation_id}
                  username={conv.recipient_username || conv.username}
                  userPhoto={conv.recipient_photo || conv.user_photo}
                  onClose={closeConversation}
                />
              ))}
            </div>
          )}
        </div>
      
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}
    </div>
  );
}

export default MessageCenter;