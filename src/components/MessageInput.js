import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

function MessageInput({ conversationId }) {
  const contentEditableRef = useRef(null);
  const [typingTimer, setTypingTimer] = useState(null);
  const { socket, currentUserId, getOtherParticipantId } = useWebSocket();
  
  useEffect(() => {
    // Handle message sent confirmation
    if (socket) {
      const messageSentHandler = (response) => {
        console.log(response);
        if (!response.success) {
          // Show error notification if needed
          console.error('Failed to send message');
        }
      };
      
      socket.on('message_sent', messageSentHandler);
      
      return () => {
        socket.off('message_sent', messageSentHandler);
      };
    }
  }, [socket]);

  const handleTyping = async () => {
    // Clear previous timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    try {
      // Get the other participant ID
      const recipientId = await getOtherParticipantId(conversationId);
      
      // Emit typing indicator
      socket.emit('typing', {
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_name: 'You', 
        recipient_id: recipientId,
        is_typing: true
      });
      
      // Set timer to stop typing indicator after delay
      const timer = setTimeout(() => {
        socket.emit('typing', {
          conversation_id: conversationId,
          sender_id: currentUserId,
          sender_name: 'You',
          recipient_id: recipientId,
          is_typing: false
        });
      }, 2000);
      
      setTypingTimer(timer);
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  };
  
  const sendMessage = () => {
    if (!contentEditableRef.current || !socket) return;
    
    const content = contentEditableRef.current.innerHTML;
    if (content.trim() === '') return;
    
    // Send message via WebSocket
    socket.emit('send_message', {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content
    });
    
    // Clear input field immediately for better UX
    contentEditableRef.current.innerHTML = '';
  };
  
  const handleFormat = (format) => {
    document.execCommand(format, false, null);
    contentEditableRef.current.focus();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="message-input-area">
      <div className="typing-indicator" style={{ display: 'none' }}></div>
      <div className="formatting-toolbar">
        <button className="format-btn" data-format="bold" onClick={() => handleFormat('bold')}>
          <i className="fas fa-bold"></i>
        </button>
        <button className="format-btn" data-format="italic" onClick={() => handleFormat('italic')}>
          <i className="fas fa-italic"></i>
        </button>
        <button className="format-btn" data-format="underline" onClick={() => handleFormat('underline')}>
          <i className="fas fa-underline"></i>
        </button>
        <button className="format-btn" data-format="strikethrough" onClick={() => handleFormat('strikethrough')}>
          <i className="fas fa-strikethrough"></i>
        </button>
        <button 
          onClick={sendMessage} 
          className="send-message-btn custom-btn btn-16"
          data-send-conversation-id={conversationId}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
      <div 
        id="message-input"
        className={`message-input message-input-${conversationId}`}
        contentEditable="true"
        ref={contentEditableRef}
        onInput={handleTyping}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default MessageInput;