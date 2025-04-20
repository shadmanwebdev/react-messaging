import React from 'react';
import '../styles/message-notification.css'; // Create this CSS file for styles

const MessageNotification = () => {
    return (
        <div id="message-notification" className="message-icon">
            <div className="message-btn">
                <FaComment />
                <span id="unread-indicator" className="unread-indicator hidden"></span>
            </div>

            <div id="message-tooltip" className="tooltip hidden"></div>

            <div id="message-dropdown" className="message-dropdown">
                <div className="unread-messages">

                {/* Search Users */}
                <div className="search-user">
                    <div className="search-user-inner">
                    <input
                        type="text"
                        className="user-search"
                        id="user-search"
                        placeholder="Search username or email..."
                    />
                    <FaSearch />
                    </div>
                    <div id="search-results" className="search-results"></div>
                </div>

                <div id="unread-conversations" className="unread-inner-div"></div>
                </div>

                <div id="messaging-popup-wrapper" className="messaging-popup-wrapper"></div>
            </div>
        </div>
    );
};

export default MessageNotification;