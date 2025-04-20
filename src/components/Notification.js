import React, { useState, useEffect } from 'react';

function Notification({ message, type, duration = 3000 }) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration]);
  
  if (!show) return null;
  
  return (
    <div className={`notification-message ${type} show`}>
      {message}
    </div>
  );
}

export default Notification;