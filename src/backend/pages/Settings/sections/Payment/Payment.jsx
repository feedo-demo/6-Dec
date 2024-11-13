/**
 * Payment Section Component
 * Features:
 * - Multiple payment methods management
 * - Card type detection and images
 * - Billing history
 * - Interactive card interface
 */

import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, FiDollarSign, FiClock, FiDownload, 
  FiPlus, FiTrash2, FiCheck
} from 'react-icons/fi';
import './Payment.css';
import SavedCard from './components/SavedCard/SavedCard';
import BillingHistory from './components/BillingHistory/BillingHistory';
import AddCard from './components/AddCard/AddCard';
import { stripeApi } from '../../../../api/stripe';
import StripeProvider from '../../../../api/providers/StripeProvider';
import { useToast } from '../../../../components/Toast/ToastContext';
import SkeletonLoading from './components/SkeletonLoading/SkeletonLoading';
import CardSkeleton from './components/SavedCard/CardSkeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AddCardPopup from '../../../../components/Popups/AddCardPopup/AddCardPopup';
import { useAuth } from '../../../../../auth/AuthContext';

// Move cardImages outside component
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
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [showAddCardPopup, setShowAddCardPopup] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Check for showAddCard parameter
  useEffect(() => {
    const shouldShowAddCard = searchParams.get('showAddCard') === 'true';
    if (shouldShowAddCard) {
      setShowAddCardPopup(true);
    }
  }, [searchParams]);

  // Format payment method to card format
  const formatPaymentMethod = (paymentMethod, isFirst = false) => ({
    id: paymentMethod.id,
    type: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    expiry: `${String(paymentMethod.card.exp_month).padStart(2, '0')}/${String(paymentMethod.card.exp_year).slice(-2)}`,
    isDefault: isFirst, // First card will be default
    cardHolder: paymentMethod.billing_details.name || 'Card Holder'
  });

  // Fetch or create customer
  const getOrCreateCustomer = async () => {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const customer = await stripeApi.getOrCreateCustomer(user.uid, user.email);
      return customer.id;
    } catch (err) {
      console.error('Error getting/creating customer:', err);
      throw new Error('Failed to initialize customer');
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async (custId) => {
    try {
      console.log('Fetching payment methods for customer:', custId);
      const paymentMethods = await stripeApi.listPaymentMethods(custId);
      console.log('Payment methods received:', paymentMethods);
      
      // Format cards and set first one as default
      const formattedCards = paymentMethods.map((pm, index) => 
        formatPaymentMethod(pm, index === 0)
      );

      // If we have cards, set the first one as default in Stripe
      if (formattedCards.length > 0) {
        await stripeApi.setDefaultPaymentMethod(custId, formattedCards[0].id)
          .catch(err => console.error('Error setting initial default card:', err));
      }

      setCards(formattedCards);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      throw new Error('Failed to load payment methods');
    }
  };

  // Fetch billing history from Stripe
  const fetchBillingHistory = async (custId) => {
    try {
      // Get invoices from Stripe
      const invoices = await stripeApi.listInvoices(custId);
      
      // Format invoices for our UI
      const formattedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        number: invoice.number,
        amount: invoice.amount_paid / 100, // Convert from cents to dollars
        status: invoice.status === 'paid' ? 'Paid' : invoice.status,
        invoice_pdf: invoice.invoice_pdf
      }));

      setBillingHistory(formattedInvoices);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.showError('Failed to load billing history');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializePaymentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get or create customer first
        const custId = await getOrCreateCustomer();
        setCustomerId(custId);
        console.log('Customer ID:', custId);

        // Then fetch payment methods
        await fetchPaymentMethods(custId);
        
        // Fetch billing history
        await fetchBillingHistory(custId);
      } catch (err) {
        console.error('Error initializing payment data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializePaymentData();
  }, []);

  const handleSetDefault = async (cardId) => {
    try {
      await stripeApi.setDefaultPaymentMethod(customerId, cardId);
      setCards(cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      })));
      toast.showSuccess('Default payment method updated');
    } catch (err) {
      console.error('Error setting default card:', err);
      toast.showError('Failed to set default payment method');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await stripeApi.deletePaymentMethod(cardId);
      setCards(cards.filter(card => card.id !== cardId));
      toast.showSuccess('Card deleted successfully');
    } catch (err) {
      console.error('Error deleting card:', err);
      toast.showError('Failed to delete card');
    }
  };

  const handleAddCard = async (paymentMethodId) => {
    try {
      await stripeApi.addPaymentMethod(customerId, paymentMethodId);
      await fetchPaymentMethods(customerId);
      toast.showSuccess('Card added successfully');
    } catch (err) {
      console.error('Error adding card:', err);
      toast.showError('Failed to add card');
      throw err;
    }
  };

  const handleUpgradeClick = () => {
    navigate('/subscription');
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

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
          <button 
            className="upgrade-plan-btn"
            onClick={() => setShowAddCardPopup(true)}
          >
            <FiPlus className="upgrade-icon" />
            <span>Add New Card</span>
          </button>
        </div>
      </div>

      <StripeProvider>
        {/* Payment Methods */}
        <div className="payment-methods">
          <div className="cards-list">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              cards.map((card) => (
                <SavedCard
                  key={card.id}
                  card={card}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDeleteCard}
                  cardImages={cardImages}
                />
              ))
            )}
          </div>
        </div>

        {/* Billing History */}
        <BillingHistory invoices={billingHistory} />

        {/* Add Card Popup */}
        <AddCardPopup 
          isOpen={showAddCardPopup}
          onClose={() => setShowAddCardPopup(false)}
          onAddCard={handleAddCard}
        />
      </StripeProvider>
    </div>
  );
};

export default Payment;