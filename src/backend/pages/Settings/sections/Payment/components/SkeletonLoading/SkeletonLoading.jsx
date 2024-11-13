/**
 * SkeletonLoading Component
 * 
 * Features:
 * - Displays animated loading state for payment section
 * - Mimics the layout of cards and billing history
 * - Provides visual feedback during data fetching
 * - Responsive design
 */

import React from 'react';
import './SkeletonLoading.css';

const SkeletonLoading = () => {
  return (
    <div className="skeleton-container">
      {/* Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-title-group">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        <div className="skeleton-button"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="skeleton-cards">
        {[1, 2].map((item) => (
          <div key={item} className="skeleton-card">
            <div className="skeleton-card-logo"></div>
            <div className="skeleton-card-number"></div>
            <div className="skeleton-card-details">
              <div className="skeleton-text-short"></div>
              <div className="skeleton-text-short"></div>
            </div>
            <div className="skeleton-card-actions">
              <div className="skeleton-button-small"></div>
              <div className="skeleton-button-icon"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Billing History Skeleton */}
      <div className="skeleton-billing">
        <div className="skeleton-billing-title"></div>
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-billing-item">
            <div className="skeleton-text-medium"></div>
            <div className="skeleton-text-short"></div>
            <div className="skeleton-text-short"></div>
            <div className="skeleton-button-small"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoading; 