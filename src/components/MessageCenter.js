import React, { useState, useEffect } from 'react';
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
      
      socket.on('conversation_created', conversationCreatedHandler);
      
      return () => {
        socket.off('conversation_created', conversationCreatedHandler);
      };
    }
  }, [socket]);
  
  const openMessagingPopup = (userId, username, userPhoto) => {
    if (socket && currentUserId) {
      socket.emit('get_conversation', {
        current_user_id: currentUserId,
        recipient_id: userId,
        recipient_username: username,
        recipient_photo: userPhoto
      });
    }
    // Remove this line to keep the dropdown open when a conversation is selected
    // setShowDropdown(false);
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
    height: "300px",
    maxHeight: "50vh"
  };
  
  return (
    <div className="message-center">
      <div id="message-notification" className="message-icon">
        <div 
          className={`message-btn ${showDropdown ? 'show-message-dropdown' : ''}`} 
          onClick={toggleDropdown}
        >
          <FaComment />
          {unreadCount > 0 && (
            <span className="unread-indicator" id="unread-indicator">{unreadCount}</span>
          )}
        </div>

        <div id="message-tooltip" className={`tooltip ${showDropdown ? '' : 'hidden'}`}>
          {unreadCount > 0 ? `You have ${unreadCount} unread message(s)` : 'No unread messages'}
        </div>
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
                />
                
                <FaSearch className="search-icon" />
              </div>
              <div id="search-results" className="search-results"></div>
            </div>
            {/* OverlayScrollbarsComponent with fixed height and y-axis scrolling only */}
            <OverlayScrollbarsComponent 
              className="unread-inner-div" 
              id="unread-conversations"
              options={scrollOptions}
              style={scrollContainerStyle}
            >
              {unreadConversations.map((conversation) => {
                let lastMessage = conversation.last_message || "No messages yet";
                lastMessage = truncateHTML(lastMessage, 30);
                
                return (
                  <div 
                    key={conversation.last_sender_id} 
                    className="unread-message conversation-item conversation-listener"
                    data-user-id={conversation.last_sender_id}
                    data-user-photo={conversation.last_sender_photo}
                    onClick={() => openMessagingPopup(
                      conversation.last_sender_id, 
                      conversation.last_sender_username, 
                      conversation.last_sender_photo
                    )}
                  >
                    <div className='msg-col-1'>
                      <div className='msg-photo'>
                        <img 
                          src={conversation.last_sender_photo.startsWith("https://") 
                            ? conversation.last_sender_photo 
                            : `https://satya.pl/serve_image.php?photo=${conversation.last_sender_photo}`}
                          alt={conversation.last_sender_username}
                        />
                      </div>
                    </div>
                    <div className='msg-col-right'>
                      <div className="msg-content">
                        <div className="conversation-username">{conversation.last_sender_username}</div> 
                        <div className="last-message" 
                          dangerouslySetInnerHTML={{ __html: lastMessage }}></div>
                      </div>
                      <span className="unread-count">{conversation.unread_count}</span>
                    </div>
                  </div>
                );
              })}
            </OverlayScrollbarsComponent>
          </div>      <div className="messaging-popup-wrapper">
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
        </div>
      )}
      

      
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}
    </div>
  );
}

export default MessageCenter;