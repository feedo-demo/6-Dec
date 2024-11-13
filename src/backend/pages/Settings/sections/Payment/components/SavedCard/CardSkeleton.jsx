/**
 * CardSkeleton Component
 * 
 * Features:
 * - Displays animated loading state for saved cards
 * - Mimics the SavedCard layout
 * - Provides visual feedback during data fetching
 */

import React from 'react';
import './CardSkeleton.css';

const CardSkeleton = () => {
  return (
    <div className="card-skeleton">
      {/* Card Logo */}
      <div className="skeleton-header">
        <div className="skeleton-logo"></div>
      </div>
      
      {/* Card Details */}
      <div className="skeleton-body">
        <div className="skeleton-number"></div>
        <div className="skeleton-details">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
      
      {/* Card Actions */}
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-icon"></div>
      </div>
    </div>
  );
};

export default CardSkeleton; 