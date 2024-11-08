/**
 * Payment Section Component
 * Features:
 * - Multiple payment methods management
 * - Card type detection and images
 * - Billing history
 * - Interactive card interface
 */

import React, { useState } from 'react';
import { 
  FiCreditCard, FiDollarSign, FiClock, FiDownload, 
  FiPlus, FiTrash2, FiCheck, FiArrowUpCircle 
} from 'react-icons/fi';
import './Payment.css';

// Card images from the web
const cardImages = {
  visa: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg',
  mastercard: 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg'
};

// eslint-disable-next-line no-unused-vars
const acceptedCardImages = {
  visa: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg',
  mastercard: 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
  amex: 'https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg',
  discover: 'https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg',
  unionpay: 'https://js.stripe.com/v3/fingerprinted/img/unionpay-8a10aefc7295216c338ba4e1224627a1.svg'
};

const Payment = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/24',
      isDefault: true,
      cardHolder: 'Mohamed Kilany'
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiry: '09/25',
      isDefault: false,
      cardHolder: 'Mohamed Kilany'
    }
  ]);

  const getCardImage = (type) => {
    return cardImages[type] || cardImages.visa; // Fallback to visa if type not found
  };

  const handleSetDefault = (cardId) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  return (
    <div className="payment-section">
      <div className="section-header">
        <div className="header-content">
          <div className="title-container">
            <h2 className="section-title">
              <FiCreditCard className="section-icon" />
              Payment Methods & Billing
            </h2>
            <p className="section-subtitle">
              Manage your payment methods and view billing history
            </p>
          </div>
          <button className="upgrade-plan-btn">
            <FiArrowUpCircle className="upgrade-icon" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <div className="cards-list">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className={`payment-card ${card.isDefault ? 'active' : ''}`}
            >
              <div className="card-header">
                <div className="card-brand-container">
                  <img 
                    src={getCardImage(card.type)} 
                    alt={`${card.type} card`}
                    className="card-brand-image"
                  />
                </div>
              </div>
              
              <div className="card-body">
                <div className="card-number">
                  •••• •••• •••• {card.last4}
                </div>
                <div className="card-details">
                  <div className="card-holder">{card.cardHolder}</div>
                  <div className="card-expiry">Expires {card.expiry}</div>
                </div>
              </div>
              
              <div className="card-actions">
                {!card.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(card.id)}
                    className="set-default-btn"
                  >
                    Set as default
                  </button>
                )}
                {!card.isDefault && (
                  <button 
                    onClick={() => handleDeleteCard(card.id)}
                    className="delete-card-btn"
                  >
                    <FiTrash2 />
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
          ))}
        </div>

        {/* Add card button */}
        {cards.length < 3 && (
          <div className="add-card-container">
            <button className="add-card-btn">
              <div className="add-card-content">
                <FiPlus className="add-icon" />
                <span>Add New Card</span>
                <p className="add-card-subtitle">
                  Securely add a new payment method
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="billing-history">
        <h3 className="subsection-title">Billing History</h3>
        <div className="history-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="history-item">
              <div className="invoice-details">
                <span className="invoice-date">Oct 1, 2023</span>
                <span className="invoice-id">#INV-2023{item}</span>
              </div>
              <div className="invoice-amount">
                <FiDollarSign className="amount-icon" />
                <span>29.99</span>
              </div>
              <div className="invoice-status success">
                <FiClock className="status-icon" />
                <span>Paid</span>
              </div>
              <button className="download-btn">
                <FiDownload />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payment;