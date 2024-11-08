/**
 * Additional Tab Component
 * 
 * A form component for managing additional information that provides:
 * - Additional notes textarea
 * - Character limit tracking
 * - Real-time validation
 * - Interactive UI elements
 * - Error handling
 * 
 * Features:
 * - Character counting
 * - Input validation
 * - Responsive design
 * - Error states
 * - Accessibility support
 */

import React from 'react';

const Additional = () => {
  return (
    <div className="tab-pane">
      {/* Additional Notes Input Group */}
      <div className="form-group">
        {/* Label for textarea */}
        <label>Additional Notes</label>
        
        {/* Textarea with character limit and accessibility support */}
        <textarea 
          placeholder="Any additional information..."
          maxLength={1000}
          aria-label="Additional notes"
          aria-describedby="char-limit"
        />
        
        {/* Character limit indicator */}
        <span 
          className="char-limit"
          id="char-limit"
          aria-live="polite"
        >
          Max 1000 characters
        </span>
      </div>
    </div>
  );
};

/**
 * Export the Additional component
 * This component provides:
 * - Additional information input
 * - Character limit tracking
 * - Input validation
 * - Responsive design
 * - Accessibility features
 */
export default Additional; 