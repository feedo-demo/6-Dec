/**
 * PaymentOptionsPopup Component
 * 
 * Features:
 * - Shows saved cards for payment
 * - Option to add new card
 * - Handles payment selection
 * - Animated transitions
 * 
 * Props:
 * @param {boolean} isOpen - Controls popup visibility
 * @param {function} onClose - Handler for closing the popup
 * @param {Array} savedCards - List of saved payment methods
 * @param {function} onSelectCard - Handler for card selection
 * @param {function} onAddNewCard - Handler for adding new card
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus } from 'react-icons/fi';
import PaymentProcessingSpinner from './PaymentProcessingSpinner';
import './PaymentOptionsPopup.css';

// Update the cardImages object to match Payment section
const cardImages = {
  visa: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg',
  mastercard: 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
  amex: 'https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg',
  discover: 'https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg',
  unionpay: 'https://js.stripe.com/v3/fingerprinted/img/unionpay-8a10aefc7295216c338ba4e1224627a1.svg',
  default: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg'
};

// Update the getCardImage function to be more robust
const getCardImage = (type) => {
  const cardType = type?.toLowerCase() || 'default';
  return cardImages[cardType] || cardImages.default;
};

const PaymentOptionsPopup = ({ 
  isOpen, 
  onClose, 
  savedCards = [], 
  onSelectCard,
  onAddNewCard 
}) => {
  const [processingCardId, setProcessingCardId] = useState(null);

  const handleCardSelection = async (card) => {
    try {
      setProcessingCardId(card.id);
      await onSelectCard(card);
    } catch (error) {
      console.error('Error processing card selection:', error);
    } finally {
      setProcessingCardId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="popup-content"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="payment-options-container">
              <div className="popup-header">
                <h3>Choose Payment Method</h3>
                <button onClick={onClose} className="close-btn">
                  <FiX />
                </button>
              </div>

              <div className="saved-cards-list">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    className={`saved-card-option ${processingCardId === card.id ? 'processing' : ''}`}
                    onClick={() => handleCardSelection(card)}
                    disabled={processingCardId !== null}
                  >
                    {processingCardId === card.id ? (
                      <PaymentProcessingSpinner />
                    ) : (
                      <>
                        <img 
                          src={getCardImage(card.type)}
                          alt={`${card.type} card`}
                          className="card-brand-image"
                        />
                        <div className="card-details">
                          <span className="card-name">{card.cardHolder}</span>
                          <span className="card-number">•••• {card.last4}</span>
                        </div>
                        {card.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </>
                    )}
                  </button>
                ))}

                <button
                  className="add-new-card-btn"
                  onClick={onAddNewCard}
                  disabled={processingCardId !== null}
                >
                  <FiPlus className="add-icon" />
                  <span>Add New Card</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentOptionsPopup; 