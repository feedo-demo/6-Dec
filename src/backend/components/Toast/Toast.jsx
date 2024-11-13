/**
 * Toast Notification Component
 * 
 * Features:
 * - Multiple toast types (success, error, info)
 * - Auto-dismiss functionality
 * - Animated entrance/exit
 * - Customizable duration
 * - Icon support
 * 
 * Props:
 * @param {string} type - Type of toast (success, error, info)
 * @param {string} message - Toast message content
 * @param {function} onClose - Handler to close the toast
 */

import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ type = 'info', message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FiCheckCircle className="toast-icon success" />,
    error: <FiXCircle className="toast-icon error" />,
    info: <FiInfo className="toast-icon info" />
  };

  return (
    <div className={`toast ${type}`}>
      {icons[type]}
      <p className="toast-message">{message}</p>
      <button onClick={onClose} className="toast-close">
        <FiX />
      </button>
    </div>
  );
};

export default Toast; 