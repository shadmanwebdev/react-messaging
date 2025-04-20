import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';
import { compareDateTimes, formatDate, formatTime } from '../utils/dateUtils';
import { checkCookie, getCookie } from '../utils/cookieUtils';
import { cleanMessage } from '../utils/messageUtils';
import { useWebSocket } from '../contexts/WebSocketContext';

function MessageList({ messages: initialMessages, conversationId }) {
    const messageListRef = useRef(null);
    const [messages, setMessages] = useState(initialMessages || []);
    const [typingIndicator, setTypingIndicator] = useState('');
    const { socket, currentUserId } = useWebSocket();
    
    useEffect(() => {
      // Update messages when initialMessages change
      setMessages(initialMessages || []);
    }, [initialMessages]);
    
    useEffect(() => {
        // Scroll to bottom when messages change
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if (socket) {
          // Handle new messages
          const receiveMessageHandler = (messageData) => {
              console.log('New message received:', messageData);
              if (messageData.conversation_id === conversationId) {
                  setMessages(prev => [...prev, messageData]);
                  scrollToBottom();
              }
          };
          
          // Handle typing indicators
          const userTypingHandler = (data) => {
              if (data.conversation_id === conversationId && data.sender_id !== currentUserId) {
                  const typingIndicator = document.querySelector(`#messaging-tab-${conversationId} .typing-indicator`);
                  if (typingIndicator) {
                      if (data.is_typing) {
                          typingIndicator.textContent = 'User is typing...';
                          typingIndicator.style.display = 'block';
                      } else {
                          typingIndicator.style.display = 'none';
                      }
                  }
              }
          };
          
          socket.on('receive_message', receiveMessageHandler);
          socket.on('user_typing', userTypingHandler);
          
          // Listen for typing events
          socket.on('typing', function(data) {
              if (data.recipient_id === currentUserId) {
                  setTypingIndicator(`${data.sender_name} is typing...`);
              }
          });
          
          return () => {
              socket.off('receive_message', receiveMessageHandler);
              socket.off('user_typing', userTypingHandler);
              socket.off('typing');
          };
        }
    }, [socket, conversationId, currentUserId]);
    
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };
    
    const processedMessages = messages.map((message, index) => {
        let lastMessageTimeCookie = null;
        const cookieExists = checkCookie('lastMessageTime');
        
        if (cookieExists) {
            lastMessageTimeCookie = getCookie('lastMessageTime');
        }
        
        const dateObj = compareDateTimes(
            message.sent_at,
            index > 0 ? messages[index - 1].sent_at : lastMessageTimeCookie
        );
        
        return {
            ...message,
            dateObj,
            showDate: !dateObj.matching_date,
            cleanContent: cleanMessage(message.content),
            isCurrentUser: message.sender_id == currentUserId
        };
    });
  
    return (
        <div className="message-list" ref={messageListRef}>
            {processedMessages.map((message, index) => (
                <Message 
                    key={`${message.conversation_id}-${message.sender_id}-${index}`}
                    message={message}
                    isCurrentUser={message.sender_id == currentUserId}
                />
            ))}
            {typingIndicator && (
                <div className="typing-indicator-message">{typingIndicator}</div>
            )}
        </div>
    );
}

export default MessageList;