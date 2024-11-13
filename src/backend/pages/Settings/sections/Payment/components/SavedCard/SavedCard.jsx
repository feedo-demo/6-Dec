/**
 * SavedCard Component
 * 
 * Features:
 * - Displays credit card information in a styled card format
 * - Shows card brand image
 * - Handles default card status
 * - Provides card management actions (set default, delete)
 * - Loading state for delete action
 * - Responsive design with hover effects
 * 
 * Props:
 * @param {Object} card - Card details (type, last4, expiry, isDefault, cardHolder)
 * @param {Function} onSetDefault - Handler for setting card as default
 * @param {Function} onDelete - Handler for deleting card
 * @param {Object} cardImages - Map of card type to card brand images
 */

import React, { useState } from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../../../../../../components/LoadingSpinner/LoadingSpinner';
import './SavedCard.css';
import DeleteSpinner from './DeleteSpinner';
import SetDefaultSpinner from './SetDefaultSpinner';

const SavedCard = ({ card, onSetDefault, onDelete, cardImages }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const getCardImage = (type) => {
    return cardImages[type.toLowerCase()] || cardImages.visa;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(card.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setIsSettingDefault(true);
      await onSetDefault(card.id);
    } catch (error) {
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
            <DeleteSpinner />
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
              <SetDefaultSpinner />
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