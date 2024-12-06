/**
 * OpportunityDetails Component
 * 
 * Features:
 * - Displays detailed information about an opportunity
 * - Uses formatted date and currency values
 * - Shows save status and loading states
 */

import React from 'react';
import { FiCalendar, FiHeart, FiX } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import AnimatedPercentage from '../../../../../components/Animated/AnimatedPercentage';
import './OpportunityDetails.css';

const OpportunityDetails = ({ opportunity, onClose }) => {
  if (!opportunity) return null;

  // Helper function to ensure progress values are valid numbers
  const getValidProgress = (value) => {
    const progress = Number(value);
    return isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="opportunity-details-page">
      {/* Header Section */}
      <div className="details-header">
        <h1 className="page-title">{opportunity.title}</h1>
        
        <div className="opportunity-action-btns">
          <button className="opportunity-btn">
            <FiCalendar />
            Calendar
          </button>
          <button 
            className={`opportunity-btn--save ${opportunity.isSaved ? 'saved' : ''}`}
            onClick={opportunity.onSave}
            disabled={opportunity.isLoading}
            aria-label={opportunity.isSaved ? 'Unsave opportunity' : 'Save opportunity'}
          >
            {opportunity.isSaved ? <FaHeart /> : <FiHeart />}
            {opportunity.isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="opportunity-btn--primary">Apply Now</button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-item">
          <label>Deadline</label>
          <span>{opportunity.formattedDeadline}</span>
        </div>
        <div className="progress-item">
          <label>Application Progress</label>
          <div className="progress-container">
            <div className="progress-bar application">
              <div 
                className="progress-fill"
                style={{ '--target-width': `${getValidProgress(opportunity.applicationProgress)}%` }}
              />
            </div>
            <span className="progress-text">
              {getValidProgress(opportunity.applicationProgress)}%
            </span>
          </div>
        </div>
        <div className="progress-item">
          <label>Match Percentage</label>
          <div className="progress-container">
            <div className="progress-bar match">
              <div 
                className="progress-fill"
                style={{ '--target-width': `${getValidProgress(opportunity.matchPercentage)}%` }}
              />
            </div>
            <span className="progress-text">
              {getValidProgress(opportunity.matchPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="details-content">
        {/* Description Section */}
        <div className="description-section">
          <h2>Description</h2>
          <p>{opportunity.description}</p>
        </div>

        {/* Requirements Section */}
        <div className="requirements-section">
          <h2>Requirements</h2>
          <ul>
            {opportunity.requirements?.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Location Section */}
        <div className="location-section">
          <h2>Location</h2>
          <p>
            {opportunity.location?.type === 'remote' ? 'Remote' : 
             `${opportunity.location?.city}, ${opportunity.location?.country}`}
          </p>
        </div>

        {/* Compensation Section */}
        <div className="compensation-section">
          <h2>Compensation</h2>
          <p>{opportunity.formattedSalary}</p>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails; 