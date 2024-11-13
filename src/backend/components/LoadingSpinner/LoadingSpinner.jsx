/**
 * LoadingSpinner Component
 * 
 * Features:
 * - Animated loading spinner
 * - Customizable size and color
 * - Optional text display
 * - Centered layout
 * 
 * Props:
 * @param {string} size - Size of the spinner (xs, sm, md, lg)
 * @param {string} color - Color class for the spinner
 * @param {string} text - Optional loading text
 */

import React from 'react';
import { FiLoader } from 'react-icons/fi';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', color = 'text-blue-500', text }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="loading-spinner-container">
      <FiLoader className={`loading-spinner ${sizeClasses[size]} ${color}`} />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner; 