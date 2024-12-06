import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../../../../../components/Button/Button';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ application, onConfirm, onCancel, isLoading }) => {
  if (!application) return null;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-icon">
          <FiAlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h3 className="delete-modal-title">Delete Application</h3>
        
        <p className="delete-modal-message">
          Are you sure you want to delete <span className="font-semibold">{application.name}</span>? 
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            type="button"
            className="delete-button"
          >
            Delete Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 