/**
 * AddCard Component
 * 
 * Features:
 * - Displays add new card button
 * - Shows card input form when clicked
 * - Handles card validation and submission
 * - Responsive design
 * 
 * Props:
 * @param {Function} onAddCard - Handler for adding new card
 * @param {boolean} initialShowForm - Whether to show the form initially
 * @param {Function} onCancel - Handler for canceling the form
 * @param {boolean} hideDefaultView - Whether to hide the default view
 * @param {boolean} hideHeader - Whether to hide the header
 */

import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './AddCard.css';
import { cardImages } from '../../assets';

const AddCard = ({ 
  onAddCard, 
  initialShowForm = false, 
  onCancel,
  hideDefaultView = false,
  hideHeader = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(initialShowForm);
  const [cardHolderName, setCardHolderName] = useState('');

  // Use effect to handle initialShowForm changes
  useEffect(() => {
    setShowForm(initialShowForm);
  }, [initialShowForm]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !cardHolderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardHolderName.trim(),
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      await onAddCard(paymentMethod.id);
      elements.getElement(CardElement).clear();
      setCardHolderName('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add card. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!showForm && hideDefaultView) {
    return null;
  }

  return (
    <div className="add-card-container">
      <div className="card-form">
        {!hideHeader && (
          <div className="form-header">
            <h3>Add New Card</h3>
            <button 
              onClick={() => setShowForm(false)}
              className="close-btn"
            >
              <FiX />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cardHolderName" className="form-label">
              Cardholder Name
            </label>
            <input
              id="cardHolderName"
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="form-input"
              placeholder="Enter cardholder name"
              required
            />
          </div>

          <div className="stripe-element-container">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                setShowForm(false);
                if (onCancel) onCancel();
              }}
              className="cancel-btn"
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!stripe || processing || !cardHolderName.trim()}
              className="submit-btn"
            >
              {processing ? (
                <span className="submit-btn-content">
                  <FiLoader className="spinner-icon" />
                  <span>Adding...</span>
                </span>
              ) : (
                'Add Card'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 