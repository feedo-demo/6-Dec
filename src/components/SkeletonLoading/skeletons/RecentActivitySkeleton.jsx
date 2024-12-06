/**
 * RecentActivitySkeleton Component
 * 
 * Features:
 * - Matches exact layout and dimensions of RecentActivity
 * - Staggered loading animations
 * - Shimmer effects
 * - Responsive design
 */

import React from 'react';

const RecentActivitySkeleton = () => {
  return (
    <div className="skeleton-container recent-activity">
      {/* Header with title */}
      <div className="skeleton-activity-header">
        <div className="skeleton-activity-title"></div>
      </div>

      {/* Activity items with staggered animation */}
      <div className="skeleton-activity-list">
        {[1, 2, 3].map((item) => (
          <div 
            key={item} 
            className="skeleton-activity-item"
            style={{ animationDelay: `${item * 150}ms` }}
          >
            {/* Icon and status indicator */}
            <div className="skeleton-activity-icon-wrapper">
              <div className="skeleton-activity-icon"></div>
              <div className="skeleton-activity-status"></div>
            </div>

            {/* Content area */}
            <div className="skeleton-activity-content">
              <div className="skeleton-activity-text">
                <div className="skeleton-activity-type"></div>
                <div className="skeleton-activity-description"></div>
              </div>
              <div className="skeleton-activity-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivitySkeleton; 