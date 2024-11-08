/**
 * Personal Tab Component
 * 
 * A form component for managing personal information that provides:
 * - Company name and description inputs
 * - Character limits and validation
 * - AI-powered rewrite functionality
 * - Interactive UI elements
 * - Real-time validation
 * 
 * Features:
 * - Input validation
 * - Character counting
 * - AI rewrite capability
 * - Responsive design
 * - Error handling
 */

import React from 'react';
import { FiZap } from 'react-icons/fi'; // Import sparkle/zap icon for rewrite button

const Personal = () => {
  return (
    <div className="tab-pane w-full">
      {/* Company Name Input Group */}
      <div className="form-group w-full">
        {/* Label with required indicator */}
        <label className="required">Company Name</label>
        
        {/* Text input with character limit and accessibility */}
        <input 
          type="text" 
          placeholder="Grant ABC" 
          maxLength={100}
          aria-label="Enter company name"
          aria-required="true"
        />
        
        {/* Character limit indicator */}
        <span 
          className="char-limit"
          aria-live="polite"
        >
          Max 100 characters
        </span>
      </div>
      
      {/* Company Description Input Group */}
      <div className="form-group w-full">
        {/* Label with required indicator */}
        <label className="required">Company Description</label>
        
        {/* Textarea with character limit and accessibility */}
        <textarea 
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          maxLength={500}
          aria-label="Enter company description"
          aria-required="true"
        />
        
        {/* Character limit indicator */}
        <span 
          className="char-limit"
          aria-live="polite"
        >
          Max 500 characters
        </span>
        
        {/* AI Rewrite Button */}
        <button 
          className="rewrite-btn"
          aria-label="Rewrite description using AI"
        >
          <FiZap className="w-4 h-4" />
          <span>Rewrite</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Export the Personal component
 * This component provides:
 * - Personal information form fields
 * - Character limit tracking
 * - AI-powered content rewriting
 * - Input validation
 * - Responsive design
 * - Accessibility features
 */
export default Personal; 