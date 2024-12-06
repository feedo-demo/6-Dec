/**
 * SkeletonLoading Component
 * 
 * Features:
 * - Central component for managing different skeleton types
 * - Imports specific skeleton components based on variant
 * - Provides consistent loading experience
 */

import React from 'react';
import './SkeletonLoading.css';
import DataSubmissionSkeleton from './skeletons/DataSubmissionSkeleton';
import RecentActivitySkeleton from './skeletons/RecentActivitySkeleton';

const SkeletonLoading = ({ variant = 'payment' }) => {
  // Return appropriate skeleton based on variant
  switch (variant) {
    case 'data-submission':
      return <DataSubmissionSkeleton />;
    case 'recent-activity':
      return <RecentActivitySkeleton />;
    default:
      return (
        <div className="skeleton-container">
          {/* Default payment skeleton content */}
          <div className="skeleton-header">
            <div className="skeleton-title-group">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>

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
  }
};

export default SkeletonLoading; 