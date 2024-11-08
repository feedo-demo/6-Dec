/**
 * SlidePanel Component
 * 
 * Purpose: Creates a sliding panel overlay for displaying detailed opportunity information
 * 
 * Features:
 * - Smooth slide-in animation from right side
 * - Backdrop overlay with blur effect
 * - Click outside to close functionality
 * - Responsive design
 * - Accessible close button
 * 
 * Props:
 * @param {boolean} isOpen - Controls panel visibility
 * @param {function} onClose - Handler for closing the panel
 * @param {object} opportunity - Opportunity data to display
 */

import React from 'react';
import { FiX } from 'react-icons/fi';  // X icon for close button
import OpportunityDetails from '../OpportunityDetails/OpportunityDetails';
import './SlidePanel.css';

const SlidePanel = ({ isOpen, onClose, opportunity }) => {
  // Early return if panel should be hidden
  if (!isOpen) return null;

  return (
    // Overlay backdrop with click-to-close functionality
    <div className="slide-panel-overlay" onClick={onClose}>
      {/* Panel wrapper - stops click propagation to prevent unwanted closing */}
      <div 
        className="slide-panel-wrapper"
        onClick={e => e.stopPropagation()}
      >
        {/* Accessible close button with icon */}
        <button 
          className="slide-panel-close-btn"
          onClick={onClose}
          aria-label="Close panel"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        {/* Content container with scroll capability */}
        <div className="slide-panel-content">
          {/* Render opportunity details if data is available */}
          {opportunity && <OpportunityDetails opportunity={opportunity} />}
        </div>
      </div>
    </div>
  );
};

export default SlidePanel; 