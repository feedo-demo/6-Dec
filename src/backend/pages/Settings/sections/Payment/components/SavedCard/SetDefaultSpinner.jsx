/**
 * SetDefaultSpinner Component
 * 
 * Features:
 * - Specific spinner for set default action
 * - Matches set default button styling
 * - Includes loading text
 */

import React from 'react';
import { FiLoader } from 'react-icons/fi';
import './SetDefaultSpinner.css';

const SetDefaultSpinner = () => {
  return (
    <div className="set-default-spinner-container">
      <FiLoader className="set-default-spinner-icon" />
      <span className="set-default-spinner-text">Setting as default...</span>
    </div>
  );
};

export default SetDefaultSpinner; 