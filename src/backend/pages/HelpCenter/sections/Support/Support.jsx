/**
 * Support Section Component
 * 
 * A comprehensive support interface that provides:
 * - Multiple contact options (request, email, chat)
 * - Interactive button animations
 * - Response time tracking
 * - Visual feedback
 * - Responsive design
 */

import React, { useState } from 'react';
import { 
  FiBookmark,      // For new request button
  FiMail,          // For email contact button
  FiMessageSquare   // For live chat button
} from 'react-icons/fi';
import { faqGirl } from '../../../../../assets';
import AnimatedNumber from '../../../../../components/Animated/AnimatedNumber';
import './Support.css';

const Support = () => {
  /**
   * State Management
   */
  const [activeButton, setActiveButton] = useState(null);  // Tracks active button for hover effects
  const [responseTime] = useState(5);                      // Average response time in minutes

  /**
   * Handle button hover effects
   * Updates active button state for enhanced visual feedback
   * @param {string} buttonId - ID of hovered button
   */
  const handleButtonHover = (buttonId) => {
    setActiveButton(buttonId);
  };

  /**
   * Handle button hover end
   * Resets active button state
   */
  const handleButtonLeave = () => {
    setActiveButton(null);
  };

  return (
    <div className="support-section">
      {/* Support content container */}
      <div className="support-content">
        {/* Section header */}
        <h2 className="support-title animate-slide-in">
          Can't Find What You're Looking For?
        </h2>
        <p className="support-subtitle animate-fade-in">
          We're here to help • Average response time: <AnimatedNumber value={responseTime} /> minutes
        </p>
        
        {/* Support action buttons */}
        <div className="support-actions">
          {/* Create new request button */}
          <button 
            className={`support-btn create ${activeButton === 'create' ? 'active' : ''}`}
            onMouseEnter={() => handleButtonHover('create')}
            onMouseLeave={handleButtonLeave}
          >
            <FiBookmark className="btn-icon" />
            <span className="btn-text">Create New Request</span>
            <div className="btn-shine"></div>
          </button>
          
          {/* Email contact button */}
          <button 
            className={`support-btn email ${activeButton === 'email' ? 'active' : ''}`}
            onMouseEnter={() => handleButtonHover('email')}
            onMouseLeave={handleButtonLeave}
          >
            <FiMail className="btn-icon" />
            <span className="btn-text">Contact with Email</span>
            <div className="btn-shine"></div>
          </button>
          
          {/* Live chat button */}
          <button 
            className={`support-btn chat ${activeButton === 'chat' ? 'active' : ''}`}
            onMouseEnter={() => handleButtonHover('chat')}
            onMouseLeave={handleButtonLeave}
          >
            <FiMessageSquare className="btn-icon" />
            <span className="btn-text">Contact with Live chat</span>
            <div className="btn-shine"></div>
          </button>
        </div>
      </div>
      
      {/* Support representative image */}
      <div className="support-image">
        <img 
          src={faqGirl} 
          alt="Support Representative"
        />
      </div>
    </div>
  );
};

/**
 * Export the Support component
 * This component provides:
 * - Multiple contact options
 * - Interactive animations
 * - Response time tracking
 * - Visual feedback
 * - Responsive design
 */
export default Support; 