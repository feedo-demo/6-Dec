/**
 * Verification Tab Component
 * 
 * A form component for managing verification information that provides:
 * - Verification code input
 * - Terms and conditions acceptance
 * - Submit functionality
 * - Input validation
 * - Interactive UI elements
 */

import React, { useState } from 'react';
import Button from '../../../../components/Button/Button';

const Verification = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    verificationCode: '',
    termsAccepted: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Verification logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tab-pane">
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
          value={formData.verificationCode}
          onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
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
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
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
        <Button
          type="submit"
          isLoading={loading}
          disabled={loading || !formData.termsAccepted}
          variant="gradient-blue"
        >
          Verify & Submit
        </Button>
      </div>
    </form>
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