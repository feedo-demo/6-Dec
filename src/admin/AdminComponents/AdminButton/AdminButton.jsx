/**
 * AdminButton Component
 * 
 * Features:
 * - Consistent admin UI button styling
 * - Loading state with spinner
 * - Multiple variants (primary, outline, danger)
 * - Gradient background for primary variant
 */

import React from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './AdminButton.css';

const AdminButton = ({ 
  children,
  variant = 'primary',
  type = 'button',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const getButtonClass = () => {
    const baseClass = 'admin-button';
    const variantClass = `admin-button-${variant}`;
    const loadingClass = isLoading ? 'loading' : '';
    return `${baseClass} ${variantClass} ${loadingClass} ${className}`.trim();
  };

  return (
    <button
      type={type}
      className={getButtonClass()}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <LoadingSpinner 
          size="sm" 
          color={variant === 'outline' ? 'text-blue-600' : 'text-white'} 
        />
      ) : (
        <div className="button-content">
          {children}
        </div>
      )}
    </button>
  );
};

export default AdminButton; 