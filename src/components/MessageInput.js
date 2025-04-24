import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { FaBold, FaLink, FaItalic, FaUnderline, FaStrikethrough, FaPaperPlane } from 'react-icons/fa';

function MessageInput({ conversationId }) {
  const contentEditableRef = useRef(null);
  const [typingTimer, setTypingTimer] = useState(null);
  const { socket, currentUserId, getOtherParticipantId } = useWebSocket();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false); // Define isLinkModalOpen and setIsLinkModalOpen
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
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
      
      // // Emit typing indicator
      // socket.emit('typing', {
      //   conversation_id: conversationId,
      //   sender_id: currentUserId,
      //   sender_name: 'You', 
      //   recipient_id: recipientId,
      //   is_typing: true
      // });
      
      // // Set timer to stop typing indicator after delay
      // const timer = setTimeout(() => {
      //   socket.emit('typing', {
      //     conversation_id: conversationId,
      //     sender_id: currentUserId,
      //     sender_name: 'You',
      //     recipient_id: recipientId,
      //     is_typing: false
      //   });
      // }, 2000);
      
      // setTypingTimer(timer);
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
    if (format === 'link') {
      // Get the currently selected text
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (selectedText) {
        setLinkText(selectedText);
        setIsLinkModalOpen(true);
      } else {
        // Optionally, you could prompt the user to select text first
        alert('Please select the text you want to turn into a link.');
        contentEditableRef.current.focus();
      }
    } else {
      document.execCommand(format, false, null);
      contentEditableRef.current.focus();
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      document.execCommand('createLink', false, linkUrl);
    }
    setIsLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('');
    contentEditableRef.current.focus();
  };

  const handleCloseLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('');
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
          <FaBold />
        </button>
        <button className="format-btn" data-format="italic" onClick={() => handleFormat('italic')}>
          <FaItalic />
        </button>
        <button className="format-btn" data-format="underline" onClick={() => handleFormat('underline')}>
          <FaUnderline />
        </button>
        <button className="format-btn" data-format="strikethrough" onClick={() => handleFormat('strikethrough')}>
          <FaStrikethrough />
        </button>
        <button className="format-btn" data-format="link" onClick={() => handleFormat('link')}>
          <FaLink aria-hidden="true" />
        </button>
        <button 
          onClick={sendMessage} 
          className="send-message-btn custom-btn btn-16"
          data-send-conversation-id={conversationId}
        >
          <FaPaperPlane className="send-icon" />
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
      {isLinkModalOpen && (
        <div className="link-modal">
          <label htmlFor="link-url">URL:</label>
          <input
            type="text"
            id="link-url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <div className="link-modal-buttons">
            <button onClick={handleInsertLink}>Insert</button>
            <button onClick={handleCloseLinkModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageInput;