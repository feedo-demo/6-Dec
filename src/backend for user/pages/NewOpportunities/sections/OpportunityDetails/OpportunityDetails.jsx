/**
 * OpportunityDetails Component
 * 
 * Features:
 * - Displays detailed information about an opportunity including description, benefits, requirements, and process
 * - Provides interactive action buttons for Calendar, Save, and Apply Now functionalities
 * - Shows progress tracking with animated percentage bars
 * - Implements save functionality using localStorage for persistence
 * - Responsive design with organized sections for better user experience
 * 
 * Props:
 * @param {Object} opportunity - The opportunity object containing all details to be displayed
 * @param {Object} opportunity.id - Unique identifier for the opportunity
 * @param {string} opportunity.name - Title of the opportunity
 * @param {string} opportunity.deadline - Application deadline date
 * @param {number} opportunity.applicationProgress - Progress percentage (0-100)
 * @param {number} opportunity.matchPercentage - Match compatibility percentage (0-100)
 * @param {Function} onClose - Callback function to handle closing the details panel
 * 
 * State:
 * - isSaved: Boolean state tracking whether the current opportunity is saved in localStorage
 * 
 * LocalStorage:
 * - 'savedOpportunities': Array of opportunity IDs stored as JSON string
 * 
 * Dependencies:
 * - react-icons/fi: For outline icons (calendar, heart)
 * - react-icons/fa: For solid heart icon
 * - AnimatedPercentage: Custom component for animated percentage display
 */

import React, { useState, useEffect } from 'react';
import { FiCalendar,  // Calendar outline icon for calendar button
         FiHeart      // Heart outline icon for unsaved state
       } from 'react-icons/fi';
import { FaHeart     // Solid heart icon for saved state
       } from 'react-icons/fa';
import AnimatedPercentage from '../../../../components/Animated/AnimatedPercentage';
import './OpportunityDetails.css';

const OpportunityDetails = ({ opportunity, onClose }) => {
  // State to track if the current opportunity is saved in localStorage
  const [isSaved, setIsSaved] = useState(false);

  /**
   * useEffect Hook - LocalStorage Integration
   * Checks if current opportunity is saved in localStorage on component mount
   * and whenever the opportunity prop changes
   * 
   * @dependency {opportunity} - Re-runs when opportunity changes
   */
  useEffect(() => {
    if (opportunity) {
      const savedOpportunities = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
      setIsSaved(savedOpportunities.includes(opportunity.id));
    }
  }, [opportunity]);

  /**
   * handleSave Function
   * Manages the save/unsave functionality for opportunities
   * 
   * @param {Event} e - The click event object
   * @effects
   * - Toggles save state in localStorage
   * - Updates isSaved state
   * - Updates UI to reflect saved/unsaved state
   */
  const handleSave = (e) => {
    e.preventDefault();
    
    const savedOpportunities = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
    
    if (isSaved) {
      // Remove opportunity from saved list
      const updatedSaved = savedOpportunities.filter(id => id !== opportunity.id);
      localStorage.setItem('savedOpportunities', JSON.stringify(updatedSaved));
    } else {
      // Add opportunity to saved list
      savedOpportunities.push(opportunity.id);
      localStorage.setItem('savedOpportunities', JSON.stringify(savedOpportunities));
    }
    
    setIsSaved(!isSaved);
  };

  // Early return if no opportunity data is provided
  if (!opportunity) return null;

  return (
    <div className="opportunity-details-page">
      {/* Header Section
          Displays the opportunity title and action buttons
          - Calendar button for scheduling
          - Save button with heart icon that toggles saved state
          - Primary Apply Now button for application submission
          
          Accessibility:
          - Save button includes aria-label that changes based on saved state
          - Icons are accompanied by text labels for clarity
      */}
      <div className="details-header">
        <h1 className="page-title">{opportunity.name}</h1>
        
        <div className="opportunity-action-btns">
          <button className="opportunity-btn">
            <FiCalendar />
            Calendar
          </button>
          <button 
            className={`opportunity-btn--save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
          >
            {isSaved ? <FaHeart /> : <FiHeart />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="opportunity-btn--primary">Apply Now</button>
        </div>
      </div>

      {/* Progress Section
          Shows three key metrics with visual indicators:
          1. Application deadline with date display
          2. Application progress with animated percentage bar (blue gradient)
          3. Match percentage showing compatibility (green gradient)
          
          Features:
          - Animated progress bars
          - Responsive grid layout
          - Visual distinction between progress types
      */}
      <div className="progress-section">
        <div className="progress-item">
          <label>Deadline</label>
          <span>{opportunity.deadline}</span>
        </div>
        <div className="progress-item">
          <label>Application Progress</label>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ '--target-width': `${opportunity.applicationProgress}%` }}
              />
            </div>
            <span className="progress-text">
              <AnimatedPercentage value={opportunity.applicationProgress} />
            </span>
          </div>
        </div>
        <div className="progress-item">
          <label>Match Percentage</label>
          <div className="progress-container">
            <div className="progress-bar match">
              <div 
                className="progress-fill" 
                style={{ '--target-width': `${opportunity.matchPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              <AnimatedPercentage value={opportunity.matchPercentage} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Section
          Contains four main subsections organized in cards:
          1. Program Description - Overview of the fellowship
          2. Benefits - List of program benefits with hover effects
          3. Required Documents - Application requirements with hover effects
          4. Application Process - Step-by-step guide with numbered indicators
          
          Features:
          - Card-based layout with consistent spacing
          - Interactive hover effects on list items
          - Visual hierarchy with headings and subheadings
          - Numbered steps with visual indicators
      */}
      <div className="details-content">
        {/* Description Section
            Provides comprehensive overview of the program
            including its purpose, goals, and target audience */}
        <div className="description-section">
          <h2>Program Description</h2>
          <p>The 2024 Innovation Fellowship Program is designed to support emerging leaders and innovators in the fields of technology, social impact, and entrepreneurship. Selected fellows will work on impactful projects that address pressing global challenges, receiving mentorship from industry experts and funding to implement their ideas. This program aims to empower individuals to transform their visions into reality while fostering a community of like-minded changemakers.</p>
        </div>

        {/* Benefits Section
            Lists all advantages and perks of the program
            using bullet points for better readability */}
        <div className="benefits-section">
          <h2>Benefits</h2>
          <ul>
            <li>
              <strong>Funding:</strong> Up to $50,000 to support project implementation.
            </li>
            <li>
              <strong>Mentorship:</strong> Access to a network of experienced mentors from various industries.
            </li>
            <li>
              <strong>Workshops:</strong> Participate in exclusive workshops on leadership, project management, and innovation strategies.
            </li>
            <li>
              <strong>Visibility:</strong> Showcase your project at the annual Innovation Summit.
            </li>
          </ul>
        </div>

        {/* Requirements Section
            Details all necessary documents and materials
            needed for application submission */}
        <div className="requirements-section">
          <h2>Required Documents</h2>
          <ul>
            <li>
              <strong>Resume/CV:</strong> A current resume detailing your educational background and work experience.
            </li>
            <li>
              <strong>Cover Letter:</strong> A one-page letter explaining your interest in the fellowship and the project you wish to pursue.
            </li>
            <li>
              <strong>Project Proposal:</strong> A detailed proposal (2-3 pages) outlining your project, objectives, and anticipated impact.
            </li>
            <li>
              <strong>References:</strong> Two professional references who can speak to your qualifications and potential.
            </li>
          </ul>
        </div>

        {/* Process Section
            Visual representation of the application process
            showing numbered steps from start to completion */}
        <div className="process-section">
          <h2>Application Process</h2>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Initial Application</h3>
                <p>Submit your resume, cover letter, and project proposal by the application deadline.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Interview</h3>
                <p>Selected candidates will be invited for a virtual interview with the selection committee.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Final Selection</h3>
                <p>Successful candidates will be notified via email and will need to confirm their participation within one week.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Onboarding</h3>
                <p>Fellows will attend an onboarding session to prepare for the program's start.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails; 