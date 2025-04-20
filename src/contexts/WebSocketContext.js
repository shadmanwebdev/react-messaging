import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getCookie } from '../utils/cookieUtils';

const WebSocketContext = createContext();

export function useWebSocket() {
    return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Connect to the WebSocket server with the proper URL
        const socketInstance = io('wss://satya.pl:3001');
        
        socketInstance.on('connect', () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
            
            // Get user ID from hidden input or cookie
            const userId = getCookie('user_id');
            if (userId) {
                setCurrentUserId(7);
                // Register user when connected
                socketInstance.emit('register_user', userId);
            }
        });
        
        socketInstance.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        });
        
        // Handle unread count updates
        socketInstance.on('unreadCount', (response) => {
            console.log("Unread count", response);
            setUnreadCount(response.unreadCount);
        });
        
        // Handle unread conversations
        socketInstance.on('unreadConversations', (response) => {
            console.log("unread conversations loaded", response);
            setUnreadConversations(response.conversations);
        });
        
        setSocket(socketInstance);
        
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Function to update notifications
    const updateNotifications = () => {
        if (socket && currentUserId) {
            socket.emit('getUnreadCount', currentUserId);
        }
    };

    // Function to load unread conversations
    const loadUnreadConversations = () => {
        if (socket && currentUserId) {
            socket.emit('getUnreadConversations', currentUserId);
            console.log("getUnreadConversations event emitted");
        }
    };

    // Function to get other participant ID in a conversation
    const getOtherParticipantId = (conversationId) => {
        return new Promise((resolve, reject) => {
            if (!socket || !currentUserId) {
                reject('Socket not connected or user ID not set');
                return;
            }
            
            socket.emit('getConversationParticipants', { conversation_id: conversationId });

            socket.once('conversationParticipants', (response) => {
                if (response.success) {
                    const otherId = response.participants.find(p => p !== currentUserId);
                    resolve(otherId);
                } else {
                    reject('Failed to get participants');
                }
            });
        });
    };

    // Set up periodic notification update
    useEffect(() => {
        if (connected && currentUserId) {
            updateNotifications();
            const interval = setInterval(updateNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [connected, currentUserId]);

    const value = {
        socket,
        connected,
        currentUserId,
        unreadCount,
        unreadConversations,
        updateNotifications,
        loadUnreadConversations,
        getOtherParticipantId,
        emit: (event, data) => {
            if (socket) {
                socket.emit(event, data);
            }
        }
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}