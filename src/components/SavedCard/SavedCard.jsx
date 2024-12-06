/**
 * SavedCard Component
 * 
 * Features:
 * - Displays saved card information
 * - Handles default card setting
 * - Card deletion functionality
 * - Loading states with appropriate spinners
 */

import React, { useState } from 'react';
import { FiMoreVertical, FiCheck, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useToast } from '../Toast/ToastContext';
import { PAYMENT_NOTIFICATIONS } from '../Toast/toastnotifications';
import './SavedCard.css';

const SavedCard = ({ card, onSetDefault, onDelete, cardImages }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const { showToast } = useToast();

  const getCardImage = (type) => {
    return cardImages[type.toLowerCase()] || cardImages.visa;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(card.id);
    } catch (error) {
      console.error('Error deleting card:', error);
      showToast(error.message || PAYMENT_NOTIFICATIONS.CARD.DELETE.ERROR, 'error');
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setIsSettingDefault(true);
      await onSetDefault(card.id);
    } catch (error) {
      console.error('Error setting default card:', error);
      showToast(error.message || PAYMENT_NOTIFICATIONS.CARD.SET_DEFAULT.ERROR, 'error');
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <div className={`saved-card ${card.isDefault ? 'active' : ''}`}>
      <div className="saved-card-header">
        <div className="saved-card-brand-container">
          <img 
            src={getCardImage(card.type)} 
            alt={`${card.type} card`}
            className="saved-card-brand-image"
          />
        </div>
        <div className="delete-container">
          {isDeleting ? (
            <LoadingSpinner 
              color="text-red-500"
              isDelete={true}
            />
          ) : (
            <button 
              onClick={handleDelete}
              className="delete-saved-card-btn"
              title={card.isDefault ? "Delete default card" : "Delete card"}
              disabled={isDeleting || isSettingDefault}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
      
      <div className="saved-card-body">
        <div className="saved-card-number">
          •••• •••• •••• {card.last4}
        </div>
        <div className="saved-card-details">
          <div className="saved-card-holder">{card.cardHolder || 'Card Holder'}</div>
          <div className="saved-card-expiry">Expires {card.expiry}</div>
        </div>
      </div>
      
      <div className="saved-card-actions">
        {!card.isDefault && (
          <button 
            onClick={handleSetDefault}
            className="set-default-btn"
            disabled={isSettingDefault || isDeleting}
          >
            {isSettingDefault ? (
              <LoadingSpinner 
                color="text-blue-500"
                isSetDefault={true}
              />
            ) : (
              'Set as default'
            )}
          </button>
        )}
      </div>

      {card.isDefault && (
        <div className="default-badge-container">
          <span className="default-badge">
            <FiCheck className="badge-icon" />
            Default
          </span>
        </div>
      )}
    </div>
  );
};

export default SavedCard; 