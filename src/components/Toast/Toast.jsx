/**
 * Enhanced Toast Component
 * 
 * Features:
 * - Custom icons per type
 * - Animated progress bar
 * - Smooth animations
 * - Accessibility improvements
 */

import React, { useEffect, useState, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);

  useEffect(() => {
    let animationFrame;
    
    const updateProgress = () => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const remaining = remainingTimeRef.current - elapsed;
        const newProgress = (remaining / duration) * 100;

        if (newProgress <= 0) {
          handleClose();
        } else {
          setProgress(newProgress);
          animationFrame = requestAnimationFrame(updateProgress);
        }
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    remainingTimeRef.current = (progress / 100) * duration;
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div 
      className={`toast ${type} ${isRemoving ? 'removing' : ''}`}
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <FiX />
      </button>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast; 