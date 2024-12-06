/**
 * DeleteSpinner Component
 * 
 * Features:
 * - Specific spinner for delete action
 * - Matches delete button styling
 * - Compact size for delete button area
 */

import React from 'react';
import { FiLoader } from 'react-icons/fi';
import './DeleteSpinner.css';

const DeleteSpinner = () => {
  return (
    <div className="delete-spinner-container">
      <FiLoader className="delete-spinner-icon" />
    </div>
  );
};

export default DeleteSpinner; 