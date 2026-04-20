import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const GroupProgress = ({ groupId, courseName }) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(`http://localhost:8000/api/group_progress/${groupId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch group progress');
        }

        const data = await response.json();
        setProgress(data.progress);
        setError(null);
      } catch (err) {
        console.error('Error fetching group progress:', err);
        setError('Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    
    // Optional: Set up polling to refresh progress
    const intervalId = setInterval(fetchProgress, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [groupId, getAccessTokenSilently]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{courseName || 'Course Progress'}</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      
      {loading ? (
        <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default GroupProgress;