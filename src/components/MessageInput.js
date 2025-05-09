import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { FaBold, FaLink, FaItalic, FaUnderline, FaStrikethrough, FaPaperPlane } from 'react-icons/fa';

function MessageInput({ conversationId }) {
  const contentEditableRef = useRef(null);
  const [typingTimer, setTypingTimer] = useState(null);
  const { socket, currentUserId, getOtherParticipantId } = useWebSocket();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [currentSelection, setCurrentSelection] = useState(null); // Store the selection

  useEffect(() => {
    // Handle message sent confirmation (rest of your useEffect)
    if (socket) {
      const messageSentHandler = (response) => {
        console.log(response);
        if (!response.success) {
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
    // Typing indicator logic (rest of your handleTyping function)
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    try {
      const recipientId = await getOtherParticipantId(conversationId);
      // ... (rest of your typing indicator logic)
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  };

  const sendMessage = () => {
    // Send message logic (rest of your sendMessage function)
    if (!contentEditableRef.current || !socket) return;

    const content = contentEditableRef.current.innerHTML;
    if (content.trim() === '') return;

    socket.emit('send_message', {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content
    });

    contentEditableRef.current.innerHTML = '';
  };

  const handleFormat = (format) => {
    if (format === 'link') {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (selectedText && selection.rangeCount > 0) {
        setCurrentSelection(selection.getRangeAt(0).cloneRange()); // Store the current range
        setLinkText(selectedText);
        setIsLinkModalOpen(true);
      } else {
        alert('Please select the text you want to turn into a link.');
        contentEditableRef.current.focus();
      }
    } else {
      document.execCommand(format, false, null);
      contentEditableRef.current.focus();
    }
  };

  const handleInsertLink = () => {
    if (linkUrl && currentSelection) {
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(currentSelection);
      document.execCommand('createLink', false, linkUrl);
    }
    setIsLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('');
    setCurrentSelection(null); // Clear the stored selection
    contentEditableRef.current.focus();
  };

  const handleCloseLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('');
    setCurrentSelection(null); // Clear the stored selection
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