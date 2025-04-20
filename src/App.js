import React from 'react';
import { WebSocketProvider } from './contexts/WebSocketContext';
import MessageCenter from './components/MessageCenter';
import './App.css';
import './styles/messaging.css';

function App() {
  // In a real app, this would come from authentication or context
  // const currentUserId = document.getElementById('sender_id')?.value || '1';
  
  return (
    <WebSocketProvider>
      <div className="app">
        <MessageCenter currentUserId={7} />
      </div>
    </WebSocketProvider>
  );
}

export default App;