// In src/components/NotificationManager.jsx

import { useState, useEffect } from "react";
import Notification from "./Notification";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  
  // Listen for WebSocket notifications
  useEffect(() => {
    // Dashboard WebSocket
    const setupDashboardWebSocket = () => {
      const { user } = JSON.parse(localStorage.getItem('auth0User') || '{}');
      if (!user) return null;
      
      const userId = user.sub?.split("|")[1] || user.sub;
      const ws = new WebSocket(`ws://localhost:8000/ws/dashboard/${userId}/`);
      
      ws.onopen = () => {
        console.log("Notification WebSocket connected");
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'assignment_update') {
          addNotification({
            message: `New assignment: ${data.assignment.course} due on ${new Date(data.assignment.deadline).toLocaleDateString()}`,
            type: 'info'
          });
        } else if (data.type === 'course_progress_update') {
          addNotification({
            message: `Course progress updated: ${data.course.title} - ${Math.round(data.course.progress)}% complete`,
            type: 'success'
          });
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      return ws;
    };
    
    // Leaderboard WebSocket
    const setupLeaderboardWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/leaderboard/');
      
      ws.onopen = () => {
        console.log("Leaderboard WebSocket connected");
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'leaderboard_update') {
          // Check if current user's rank changed
          const { user } = JSON.parse(localStorage.getItem('auth0User') || '{}');
          if (!user) return;
          
          const currentUser = data.leaderboard.find(u => u.name === user.name);
          if (currentUser) {
            const oldRank = parseInt(localStorage.getItem('userRank') || '0');
            const newRank = data.leaderboard.findIndex(u => u.name === user.name) + 1;
            
            if (oldRank > 0 && newRank < oldRank) {
              addNotification({
                message: `Your leaderboard rank improved to #${newRank}!`,
                type: 'success'
              });
            }
            
            localStorage.setItem('userRank', newRank.toString());
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      return ws;
    };
    
    const dashboardWs = setupDashboardWebSocket();
    const leaderboardWs = setupLeaderboardWebSocket();
    
    return () => {
      if (dashboardWs) dashboardWs.close();
      if (leaderboardWs) leaderboardWs.close();
    };
  }, []);
  
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, ...notification }]);
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationManager;