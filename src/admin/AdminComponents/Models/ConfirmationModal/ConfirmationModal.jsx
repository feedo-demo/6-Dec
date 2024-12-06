/**
 * ConfirmationModal Component
 * 
 * Features:
 * - Reusable confirmation dialog
 * - Customizable message and actions
 * - Consistent styling
 */

import React from 'react';
import AdminButton from '../../AdminButton/AdminButton';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-header">
          <h3>{title}</h3>
        </div>
        <div className="confirmation-body">
          <p className="confirmation-message">{message}</p>
        </div>
        <div className="confirmation-footer">
          <AdminButton
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </AdminButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 