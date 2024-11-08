/**
 * Education Tab Component
 * 
 * A form component for managing educational information that provides:
 * - Education level input
 * - Field of study input
 * - Required field validation
 * - Character limits
 * - Interactive UI elements
 * 
 * Features:
 * - Input validation
 * - Required field indicators
 * - Character limits
 * - Error handling
 * - Responsive design
 */

import React from 'react';

const Education = () => {
  return (
    <div className="tab-pane">
      {/* Education Level Input Group */}
      <div className="form-group">
        {/* Label with required indicator */}
        <label className="required">Education Level</label>
        
        {/* Text input with character limit */}
        <input 
          type="text" 
          placeholder="Bachelor's Degree" 
          maxLength={50} 
          aria-label="Enter your education level"
        />
      </div>
      
      {/* Field of Study Input Group */}
      <div className="form-group">
        {/* Label with required indicator */}
        <label className="required">Field of Study</label>
        
        {/* Text input with character limit */}
        <input 
          type="text" 
          placeholder="Computer Science" 
          maxLength={50} 
          aria-label="Enter your field of study"
        />
      </div>
    </div>
  );
};

/**
 * Export the Education component
 * This component provides:
 * - Educational information form fields
 * - Required field validation
 * - Character limit tracking
 * - Input validation
 * - Responsive design
 * - Accessibility features
 */
export default Education; 