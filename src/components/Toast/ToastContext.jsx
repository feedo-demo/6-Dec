/**
 * Toast Context Provider
 * 
 * Features:
 * - Global toast state management
 * - Multiple toast support
 * - Toast queue system
 * - Auto-cleanup
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
import './Toast.css';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(currentToasts => [...currentToasts, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(currentToasts => 
        currentToasts.filter(toast => toast.id !== id)
      );
    }, 4000); // Match duration from Toast component
  }, []);

  // Add specific methods for success and error toasts
  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts(currentToasts => 
      currentToasts.filter(toast => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { ToastContext }; 