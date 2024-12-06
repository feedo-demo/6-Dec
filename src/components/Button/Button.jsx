/**
 * Button Component
 * 
 * A comprehensive button component library with multiple variants and loading states.
 * 
 * Props for LoadingSpinner:
 * @param {string} size - Controls the size of the spinner. Options: 'small', 'medium' (default), 'large'
 * 
 * Props for Button:
 * @param {boolean} isLoading - Controls the loading state
 * @param {boolean} disabled - Disables the button
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (default: 'button')
 * @param {node} children - Button content
 * @param {string} className - Additional classes
 * @param {string} variant - Button style variant:
 *   - 'gradient-blue' (default) - Blue gradient (#0093E9 to #80D0C7)
 *   - 'gradient-purple' - Purple gradient (#8B5CF6 to #D946EF)
 *   - 'gradient-orange' - Orange gradient (#F97316 to #FBBF24)
 *   - 'upgrade' - Light blue shining button
 *   - 'create' - Dark blue shining button
 *   - 'outline' - Bordered button
 *   - 'danger' - Red gradient
 *   - 'success' - Green gradient
 * 
 * Usage:
 * <Button variant="gradient-purple" isLoading={loading}>Submit</Button>
 */

import React from 'react';
import './Button.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  return <div className={`spinner ${size}`} />;
};

export const Button = ({ 
  isLoading, 
  disabled, 
  onClick, 
  type = 'button',
  children,
  className = '',
  variant = 'gradient-blue'
}) => {
  const baseClass = `custom-button button-${variant}`;
  
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClass} ${isLoading ? 'is-loading' : ''} ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <>
          <span className="relative z-10">{children}</span>
          {(variant === 'upgrade' || variant === 'create') && (
            <div className="shine-effect" aria-hidden="true"></div>
          )}
        </>
      )}
    </button>
  );
};

export default Button; 