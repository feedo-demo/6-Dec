/**
 * DataSubmissionSkeleton Component
 * 
 * Features:
 * - Matches exact layout and dimensions of DataSubmission
 * - Animated shimmer effects
 * - Staggered loading animations
 * - Responsive design
 */

import React from 'react';

const DataSubmissionSkeleton = () => {
  return (
    <div className="skeleton-container data-submission">
      {/* Header */}
      <div className="skeleton-data-header">
        <div className="skeleton-data-title"></div>
      </div>

      {/* Profile Section with Progress Circle */}
      <div className="skeleton-profile-section">
        <div className="skeleton-avatar-wrapper">
          <div className="skeleton-avatar-container">
            <div className="skeleton-avatar"></div>
            {/* Circular progress indicator */}
            <div className="skeleton-progress-ring">
              <div className="skeleton-progress-circle"></div>
              <div className="skeleton-progress-pill"></div>
            </div>
          </div>
        </div>
        <div className="skeleton-profile-info">
          <div className="skeleton-profile-name"></div>
          <div className="skeleton-profile-type"></div>
        </div>
      </div>

      {/* Submission Items with staggered animation */}
      <div className="skeleton-submission-items">
        {[1, 2, 3, 4].map((item) => (
          <div 
            key={item} 
            className="skeleton-submission-item"
            style={{ animationDelay: `${item * 100}ms` }}
          >
            <div className="skeleton-item-content">
              <div className="skeleton-status-icon"></div>
              <div className="skeleton-item-text">
                <div className="skeleton-item-title"></div>
                <div className="skeleton-item-label"></div>
              </div>
            </div>
            <div className="skeleton-chevron"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSubmissionSkeleton; 