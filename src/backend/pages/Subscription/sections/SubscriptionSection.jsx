/**
 * Subscription Section Component
 * Renders the subscription plans with pricing toggle
 * All styles moved to SubscriptionSection.css
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Toast/ToastContext';
import './SubscriptionSection.css';
import AddCardPopup from '../../../components/Popups/AddCardPopup/AddCardPopup';
import { stripeApi } from '../../../api/stripe';
import { FiLoader, FiCreditCard, FiCheck } from 'react-icons/fi';
import StripeProvider from '../../../api/providers/StripeProvider';
import PaymentOptionsPopup from '../../../components/Popups/PaymentOptionsPopup/PaymentOptionsPopup';
import { useAuth } from '../../../../auth/AuthContext';

const SubscriptionSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showAddCardPopup, setShowAddCardPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const { user } = useAuth();

  // Fetch current subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        // Get the selected plan from localStorage
        const storedPlan = localStorage.getItem('selectedPlan');
        const hasPaymentMethod = localStorage.getItem('hasPaymentMethod');

        // If user has added a payment method and selected a plan, update the current plan
        if (storedPlan && hasPaymentMethod === 'true') {
          setCurrentPlan(storedPlan);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  // Update useEffect to fetch saved cards using logged-in user data
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        // Get or create customer using logged-in user's data
        const customer = await stripeApi.getOrCreateCustomer(user.uid, user.email);

        // Get the stored payment method status
        const hasPaymentMethod = localStorage.getItem('hasPaymentMethod') === 'true';
        setHasPaymentMethods(hasPaymentMethod);

        if (hasPaymentMethod) {
          // Fetch real payment methods from Stripe for the logged-in user
          const paymentMethods = await stripeApi.listPaymentMethods(customer.id);
          
          // Format the payment methods to match our card format
          const formattedCards = paymentMethods.map((pm, index) => ({
            id: pm.id,
            type: pm.card.brand,
            last4: pm.card.last4,
            expiry: `${String(pm.card.exp_month).padStart(2, '0')}/${String(pm.card.exp_year).slice(-2)}`,
            isDefault: index === 0,
            cardHolder: pm.billing_details.name || user.profile?.fullName || 'Card Holder'
          }));

          setSavedCards(formattedCards);
        }
      } catch (error) {
        console.error('Error checking payment methods:', error);
        toast.showError('Failed to load payment methods');
      }
    };

    fetchSavedCards();
  }, [user]); // Add user to dependency array

  const handleUpgrade = async (planName) => {
    try {
      setIsProcessing(true);
      setSelectedPlan(planName);
      
      // If user has saved cards, show payment options
      if (hasPaymentMethods) {
        setShowPaymentOptions(true);
      } else {
        // If no saved cards, show add card popup
        setShowAddCardPopup(true);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.showError('Failed to upgrade plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = async (paymentMethodId) => {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get or create customer
      const customer = await stripeApi.getOrCreateCustomer(user.uid, user.email);
      
      // Add payment method
      await stripeApi.addPaymentMethod(customer.id, paymentMethodId);
      
      // Set this card as default
      await stripeApi.setDefaultPaymentMethod(customer.id, paymentMethodId);
      
      // Update local storage to indicate payment method is added
      localStorage.setItem('hasPaymentMethod', 'true');
      
      // Only update subscription if we have a selected plan
      if (selectedPlan) {
        try {
          // Get price ID based on plan and billing interval
          const priceId = getPriceId(selectedPlan, isAnnual);
          
          // Create subscription with the new card
          await stripeApi.createSubscription(customer.id, priceId);
          
          // Update UI state
          setCurrentPlan(selectedPlan);
          localStorage.setItem('selectedPlan', selectedPlan);
          
          toast.showSuccess(
            `Successfully subscribed to ${selectedPlan} plan${isAnnual ? ' (Annual)' : ' (Monthly)'}`
          );
          
          setShowAcknowledgment(true);
          setTimeout(() => {
            setShowAcknowledgment(false);
          }, 5000);
        } catch (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          toast.showError('Failed to create subscription. Please try again.');
          throw subscriptionError;
        }
      }
      
      setShowAddCardPopup(false);
    } catch (error) {
      console.error('Card error:', error);
      toast.showError('Failed to add card. Please try again.');
      throw error;
    }
  };

  const handleClosePopup = () => {
    setShowAddCardPopup(false);
    setShowPaymentOptions(false);
    setSelectedPlan(null); // Reset selected plan when closing popup
  };

  const handleCardSelection = async (card) => {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      if (!selectedPlan) {
        toast.showError('No plan selected');
        return;
      }

      // Get price ID based on plan and billing interval
      const priceId = getPriceId(selectedPlan, isAnnual);
      
      // Get customer
      const customer = await stripeApi.getOrCreateCustomer(user.uid, user.email);
      
      // Set the selected card as default payment method
      await stripeApi.setDefaultPaymentMethod(customer.id, card.id);
      
      // Create subscription with the selected card
      await stripeApi.createSubscription(customer.id, priceId);
      
      // Update UI state
      setCurrentPlan(selectedPlan);
      localStorage.setItem('selectedPlan', selectedPlan);
      
      toast.showSuccess(
        `Successfully subscribed to ${selectedPlan} plan${isAnnual ? ' (Annual)' : ' (Monthly)'}`
      );
      
      setShowAcknowledgment(true);
      setTimeout(() => {
        setShowAcknowledgment(false);
      }, 5000);

      // Close the payment options popup
      setShowPaymentOptions(false);
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.showError('Failed to process payment. Please try again.');
    }
  };

  // Helper function to get Stripe price ID
  const getPriceId = (planName, isAnnual) => {
    // Replace these with your actual Stripe price IDs from your dashboard
    const priceIds = {
      Basic: {
        monthly: 'price_YOUR_BASIC_MONTHLY_ID',    // Replace with your Basic Monthly price ID
        annual: 'price_YOUR_BASIC_ANNUAL_ID'       // Replace with your Basic Annual price ID
      },
      Premium: {
        monthly: 'price_YOUR_PREMIUM_MONTHLY_ID',  // Replace with your Premium Monthly price ID
        annual: 'price_YOUR_PREMIUM_ANNUAL_ID'     // Replace with your Premium Annual price ID
      },
      Business: {
        monthly: 'price_YOUR_BUSINESS_MONTHLY_ID', // Replace with your Business Monthly price ID
        annual: 'price_YOUR_BUSINESS_ANNUAL_ID'    // Replace with your Business Annual price ID
      }
    };

    return priceIds[planName][isAnnual ? 'annual' : 'monthly'];
  };

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Basic Resume Builder',
        '10 Job Applications/month',
        'Basic Job Matches',
        'Community Support',
        'Email Support'
      ],
      popular: false,
      active: currentPlan === 'Basic',
    },
    {
      name: 'Premium',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      features: [
        'Advanced Resume Builder',
        'Unlimited Job Applications',
        'Priority Job Matches',
        'Cover Letter Generator',
        'Interview Preparation',
        'Priority Support',
        'Career Path Planning'
      ],
      popular: true,
      active: currentPlan === 'Premium',
    },
    {
      name: 'Business',
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      features: [
        'Everything in Premium',
        'Multiple Team Members',
        'Team Analytics',
        'Custom Branding',
        'API Access',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Features'
      ],
      popular: false,
      active: currentPlan === 'Business',
    },
  ];

  return (
    <section className="section-wrapper">
      {showAcknowledgment && (
        <motion.div 
          className="acknowledgment-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="acknowledgment-content">
            <FiCheck className="acknowledgment-icon" />
            <div className="acknowledgment-text">
              <h4>Subscription Activated!</h4>
              <p>You are now subscribed to the {currentPlan} plan{isAnnual ? ' (Annual)' : ' (Monthly)'}.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="background-animation" />
      
      <div className="toggle-container">
        <div className="toggle-wrapper">
          <span className={!isAnnual ? 'active' : ''}>Monthly</span>
          <button 
            className={`toggle-button ${isAnnual ? 'active' : ''}`} 
            onClick={() => setIsAnnual(!isAnnual)}
            aria-checked={isAnnual}
            role="switch"
          >
            <motion.div 
              className="toggle-slider"
              initial={false}
              animate={{ 
                x: isAnnual ? 24 : 4,
                width: '16px'
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8
              }}
            />
          </button>
          <span className={isAnnual ? 'active' : ''}>
            Annual <span className="save-badge">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="cards-container">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.active ? 'active' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                {plan.active && <div className="active-badge">Current Plan</div>}
                <h3>{plan.name}</h3>
                <p className="description">
                  {plan.name === 'Basic' && 'Perfect for getting started'}
                  {plan.name === 'Premium' && 'Best for professionals'}
                  {plan.name === 'Business' && 'For teams and businesses'}
                </p>
                <div className="price-tag">
                  {plan.monthlyPrice > 0 && <span>$</span>}
                  <AnimatePresence mode="wait">
                    <motion.span
                      className="amount"
                      data-price={plan.monthlyPrice}
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      {plan.monthlyPrice === 0 ? 'Free' : (isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                    </motion.span>
                  </AnimatePresence>
                  {plan.monthlyPrice > 0 && (
                    <span className="period">{isAnnual ? '/year' : '/mo'}</span>
                  )}
                </div>
                <ul className="features-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="feature-item">
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`select-button ${plan.popular ? 'popular' : ''} ${plan.active ? 'active' : ''}`}
                  disabled={plan.active || isProcessing}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.active ? 'Current Plan' : (
                    isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {plan.name === 'Basic' ? (
                          'Get Started Free'
                        ) : (
                          <>
                            <FiCreditCard />
                            {hasPaymentMethods ? 'Upgrade Now' : 'Add Payment Method'}
                          </>
                        )}
                      </span>
                    )
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Options Popup */}
      <PaymentOptionsPopup 
        isOpen={showPaymentOptions}
        onClose={() => setShowPaymentOptions(false)}
        savedCards={savedCards}
        onSelectCard={handleCardSelection}
        onAddNewCard={() => {
          setShowPaymentOptions(false);
          setShowAddCardPopup(true);
        }}
      />

      {/* Add Card Popup */}
      <StripeProvider>
        <AddCardPopup 
          isOpen={showAddCardPopup}
          onClose={handleClosePopup}
          onAddCard={handleAddCard}
        />
      </StripeProvider>
    </section>
  );
};

export default SubscriptionSection; 