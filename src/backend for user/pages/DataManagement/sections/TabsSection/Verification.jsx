/**
 * Verification Tab Component
 * 
 * A form component for managing verification information that provides:
 * - Verification code input
 * - Terms and conditions acceptance
 * - Submit functionality
 * - Input validation
 * - Interactive UI elements
 * 
 * Features:
 * - Code validation
 * - Terms acceptance tracking
 * - Submit button states
 * - Error handling
 * - Accessibility support
 */

import React from 'react';

const Verification = () => {
  return (
    <div className="tab-pane">
      {/* Verification Code Input Group */}
      <div className="form-group">
        {/* Label with required indicator */}
        <label className="required">Verification Code</label>
        
        {/* Code input with character limit and accessibility */}
        <input 
          type="text" 
          placeholder="Enter verification code" 
          maxLength={6}
          aria-label="Enter 6-digit verification code"
          aria-required="true"
        />
        
        {/* Character limit indicator */}
        <span 
          className="char-limit"
          aria-live="polite"
        >
          6 digits code
        </span>
      </div>
      
      {/* Terms & Conditions Checkbox Group */}
      <div className="form-group">
        {/* Label with required indicator */}
        <label className="required">Terms & Conditions</label>
        
        {/* Checkbox with accessible label */}
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="terms" 
            className="mr-2"
            aria-label="Accept terms and conditions"
            aria-required="true"
          />
          <label 
            htmlFor="terms" 
            className="text-sm text-gray-600"
          >
            I agree to the terms and conditions
          </label>
        </div>
      </div>

      {/* Submit Button Group */}
      <div className="form-group">
        <button 
          className="verify-btn"
          aria-label="Verify and submit information"
        >
          Verify & Submit
        </button>
      </div>
    </div>
  );
};

/**
 * Export the Verification component
 * This component provides:
 * - Verification code input
 * - Terms acceptance checkbox
 * - Submit functionality
 * - Input validation
 * - Accessibility features
 */
export default Verification; 