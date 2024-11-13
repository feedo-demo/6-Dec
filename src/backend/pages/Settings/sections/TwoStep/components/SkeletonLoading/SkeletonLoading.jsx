/**
 * SkeletonLoading Component for TwoStep Section
 * 
 * Features:
 * - Displays animated loading state for two-step section
 * - Mimics the layout of the actual component
 * - Provides visual feedback during data fetching
 */

import React from 'react';
import './SkeletonLoading.css';

const SkeletonLoading = () => {
  return (
    <div className="skeleton-container">
      {/* Title Skeleton */}
      <div className="skeleton-title"></div>

      {/* Security Status Skeleton */}
      <div className="skeleton-security-status">
        <div className="skeleton-icon"></div>
        <div className="skeleton-info">
          <div className="skeleton-title-text"></div>
          <div className="skeleton-description"></div>
        </div>
        <div className="skeleton-toggle"></div>
      </div>

      {/* Authentication Options Skeleton */}
      <div className="skeleton-auth-option">
        <div className="skeleton-icon"></div>
        <div className="skeleton-info">
          <div className="skeleton-title-text"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading; 