import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useWebSocket } from '../contexts/WebSocketContext';

function ConversationTab({ 
  conversationId, 
  username, 
  userPhoto, 
  currentUserId,
  onClose,
  onMinimize
}) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const { socket, emit } = useWebSocket();
  
  useEffect(() => {
    if (socket) {
      // Request messages for this conversation
      emit('get_messages', {
        conversation_id: conversationId
      });
      
      // Listen for messages
      const messageHandler = (data) => {
        if (data.conversation_id === conversationId) {
          setMessages(prev => [...prev, data]);
        }
      };
      
      // Listen for typing indicators
      const typingHandler = (data) => {
        if (data.conversation_id === conversationId && 
            data.user_id !== currentUserId) {
          setIsTyping(data.is_typing);
        }
      };
      
      // Listen for loaded messages
      const messagesLoadedHandler = (data) => {
        if (data.conversation_id === conversationId) {
          setMessages(data.messages);
        }
      };
      
      socket.on('new_message', messageHandler);
      socket.on('typing', typingHandler);
      socket.on('messages_loaded', messagesLoadedHandler);
      
      return () => {
        socket.off('new_message', messageHandler);
        socket.off('typing', typingHandler);
        socket.off('messages_loaded', messagesLoadedHandler);
      };
    }
  }, [socket, conversationId, currentUserId]);
  
  const handleMinimize = () => {
    setMinimized(!minimized);
    if (onMinimize) {
      onMinimize(conversationId);
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose(conversationId);
    }
  };

  return (
    <div className={`messaging-popup ${minimized ? 'minimized' : ''}`} id={`messaging-tab-${conversationId}`}>
      <div className="conversation-header">
        <img 
          className="avatar" 
          src={userPhoto.startsWith("https://") ? userPhoto : `https://satya.pl/serve_image.php?photo=${userPhoto}`}
          alt={`${username}'s avatar`}
        />
        <span className="conversation-username">{username}</span>
        <span className="minimize" onClick={handleMinimize}>
          <i className="fa-regular fa-window-minimize"></i>
        </span>
        <span className="close" onClick={handleClose}>
          <i className="fa-regular fa-x"></i>
        </span>
      </div>
      <div className="conversation-body">
        <div className="notification-container">
          <div className="notification-message"></div>
        </div>
        <div className="message-list-outer">
          <MessageList 
            messages={messages} 
            conversationId={conversationId} 
            currentUserId={currentUserId} 
          />
        </div>
        <div className="typing-indicator" style={{ display: isTyping ? 'block' : 'none' }}>
          {username} is typing...
        </div>
        <MessageInput 
          conversationId={conversationId} 
          senderId={currentUserId} 
        />
      </div>
    </div>
  );
}

export default ConversationTab;