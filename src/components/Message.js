import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';

function Message({ message, isCurrentUser }) {
    const messageClass = isCurrentUser ? 'sent' : 'received';
    
    return (
        <div className={`message ${messageClass}`}>
        <div className="top-row">
            <div className="message-meta">
            {message.showDate && (
                <div className="message-datetime">
                <span className="left"></span>
                <span className="message-date">{formatDate(message.dateObj.date)}</span>
                <span className="right"></span>
                </div>
            )}
            </div>
        </div>
        <div className="bottom-row">
            <div className="message-col-left">
            <div className="message-time">
                <p>{formatTime(message.dateObj.time)}</p>
            </div>
            <div 
                className="message-content"
                dangerouslySetInnerHTML={{ __html: message.cleanContent }}
            />
            </div>
        </div>
        </div>
    );
}

export default Message;