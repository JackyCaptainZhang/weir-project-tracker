import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const AutoLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      navigate('/login');
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initial timer setup
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default AutoLogout; 