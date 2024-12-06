/**
 * EnhanceWithAI Component
 * 
 * A reusable button component for AI text enhancement functionality
 * Features:
 * - Consistent styling across the application
 * - Loading state handling
 * - Disabled state when no text is present
 */

import React from 'react';
import { FiZap } from 'react-icons/fi';
import './EnhanceWithAI.css';

const EnhanceWithAI = ({ onClick, isDisabled, isLoading, text = "Enhance" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="enhance-btn"
      disabled={isDisabled || isLoading}
      title="Enhance with AI"
    >
      <FiZap className="w-3.5 h-3.5" />
      <span>{text}</span>
    </button>
  );
};

export default EnhanceWithAI; 