// In src/components/Notification.jsx

import { useState, useEffect } from "react";
import { Bell, X } from 'lucide-react';

const Notification = ({ message, type = "info", duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!visible) return null;
  
  const bgColor = {
    info: "bg-blue-50 border-blue-500",
    success: "bg-green-50 border-green-500",
    warning: "bg-yellow-50 border-yellow-500",
    error: "bg-red-50 border-red-500",
  }[type];
  
  const textColor = {
    info: "text-blue-700",
    success: "text-green-700",
    warning: "text-yellow-700",
    error: "text-red-700",
  }[type];
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md border-l-4 ${bgColor} max-w-md`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Bell className={`h-5 w-5 ${textColor}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className={`inline-flex ${textColor} focus:outline-none`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;