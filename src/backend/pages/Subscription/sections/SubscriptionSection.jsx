/**
 * Subscription Section Component
 * Renders the subscription plans with pricing toggle
 * All styles moved to SubscriptionSection.css
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../components/Toast/ToastContext';
import './SubscriptionSection.css';
import AddCardPopup from '../../../../components/Popups/AddCardPopup/AddCardPopup';
import { stripeApi } from '../../../../api/stripe';
import { FiLoader, FiCreditCard, FiCheck } from 'react-icons/fi';
import StripeProvider from '../../../../api/providers/StripeProvider';
import PaymentOptionsPopup from '../../../../components/Popups/PaymentOptionsPopup/PaymentOptionsPopup';
import { useAuth } from '../../../../auth/AuthContext';
import { PAYMENT_NOTIFICATIONS } from '../../../../components/Toast/toastnotifications';

const SubscriptionSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showAddCardPopup, setShowAddCardPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const { user } = useAuth();

  // Update useEffect to fetch saved cards using logged-in user data
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        // Get user data from transformed structure
        const userId = user.profile?.authUid;
        const userEmail = user.profile?.email || user.email;

        if (!userId || !userEmail) {
          console.error('Missing user data:', { user });
          return;
        }

        // Get or create customer using transformed user data
        const customer = await stripeApi.getOrCreateCustomer(userId, userEmail);

        // Get the stored payment method status
        const paymentMethods = await stripeApi.listPaymentMethods(customer.id);
        const hasPaymentMethod = paymentMethods.length > 0;
        setHasPaymentMethods(hasPaymentMethod);

        if (hasPaymentMethod) {
          // Format the payment methods to match our card format
          const formattedCards = paymentMethods.map((pm, index) => ({
            id: pm.id,
            type: pm.card.brand,
            last4: pm.card.last4,
            expiry: `${String(pm.card.exp_month).padStart(2, '0')}/${String(pm.card.exp_year).slice(-2)}`,
            isDefault: index === 0,
            cardHolder: pm.billing_details.name || user.displayName || 'Card Holder'
          }));

          setSavedCards(formattedCards);
        }
      } catch (error) {
        console.error('Error checking payment methods:', error);
        toast.showError('Failed to load payment methods');
      }
    };

    fetchSavedCards();
  }, [user]);

  // Update the checkSubscriptionStatus effect
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const checkSubscriptionStatus = async () => {
      if (!user || !isMounted) return;
      
      try {
        const userId = user.profile?.authUid;
        const userEmail = user.profile?.email || user.email;

        if (!userId || !userEmail) {
          console.error('Missing user data:', { user });
          return;
        }

        const customer = await stripeApi.getOrCreateCustomer(userId, userEmail);
        const subscriptionDetails = await stripeApi.getSubscriptionDetails(customer.id);
        
        if (subscriptionDetails && isMounted) {
          console.log('Subscription details:', subscriptionDetails);
          
          if (subscriptionDetails.status === 'active') {
            setCurrentPlan(subscriptionDetails.planName);
            console.log('Active subscription found:', subscriptionDetails.planName);
            // Clear interval once we confirm active subscription
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          } else {
            console.log('Subscription status:', subscriptionDetails.status);
            setCurrentPlan(null);
          }
          // Reset retry count on successful check
          retryCount = 0;
        } else {
          console.log('No active subscription found');
          if (isMounted) setCurrentPlan(null);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        if (isMounted) {
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
            console.log('Max retries reached, stopping subscription checks');
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
          setCurrentPlan(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    };

    // Set loading state
    setIsLoadingStatus(true);
    
    // Initial check
    checkSubscriptionStatus();

    // Set up polling with shorter interval during subscription creation
    intervalId = setInterval(checkSubscriptionStatus, 3000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      setShowPaymentOptions(false);
      setShowAddCardPopup(false);
      setIsProcessing(false);
      setIsLoadingStatus(false);
    };
  }, [user]);

  const handleUpgrade = async (planName) => {
    try {
      setIsProcessing(true);
      setSelectedPlan(planName);
      
      // If user has saved cards, show payment options
      if (hasPaymentMethods) {
        setShowPaymentOptions(true);
      } else {
        // If no saved cards, directly show add card popup
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

      // Get user data from transformed structure
      const userId = user.profile?.authUid;
      const userEmail = user.profile?.email || user.email;

      if (!userId || !userEmail) {
        throw new Error('Missing user data');
      }

      // Get or create customer
      const customer = await stripeApi.getOrCreateCustomer(userId, userEmail);
      
      // Add payment method
      await stripeApi.addPaymentMethod(customer.id, paymentMethodId);
      
      // Set this card as default
      await stripeApi.setDefaultPaymentMethod(customer.id, paymentMethodId);
      
      // Only update subscription if we have a selected plan
      if (selectedPlan) {
        try {
          // Get price ID based on plan and billing interval
          const priceId = getPriceId(selectedPlan, isAnnual);
          
          // Create subscription with the new card
          await stripeApi.createSubscription(customer.id, priceId);
          
          // Update UI state
          setCurrentPlan(selectedPlan);
          
          toast.showSuccess(
            `Successfully subscribed to ${selectedPlan} plan${isAnnual ? ' (Annual)' : ' (Monthly)'}`
          );
          
          setShowAddCardPopup(false);
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
    setSelectedPlan(null);
    setIsProcessing(false);
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

      setIsProcessing(true);
      const priceId = getPriceId(selectedPlan, isAnnual);
      
      try {
        // Get customer
        const customer = await stripeApi.getOrCreateCustomer(
          user.profile?.authUid,
          user.profile?.email || user.email
        );

        // Create new subscription with the selected card
        console.log('Creating subscription with:', {
          customerId: customer.id,
          priceId,
          paymentMethodId: card.id
        });

        const { subscription } = await stripeApi.createSubscription(
          customer.id,
          priceId,
          card.id
        );

        if (!subscription) {
          throw new Error('Failed to create subscription');
        }

        console.log('Subscription created:', subscription);

        // Check subscription status
        if (subscription.status === 'active') {
          // Update local state immediately
          setCurrentPlan(selectedPlan);
          
          // Show success message
          toast.showToast(
            PAYMENT_NOTIFICATIONS.SUBSCRIPTION.SUCCESS(
              selectedPlan,
              isAnnual ? 'annual' : 'monthly',
              isAnnual ? plans.find(p => p.name === selectedPlan)?.annualPrice : plans.find(p => p.name === selectedPlan)?.monthlyPrice
            ),
            'success'
          );

          // Close popup and reset state
          setShowPaymentOptions(false);
          setSelectedPlan(null);
        } else {
          throw new Error(
            subscription.lastPaymentError || 
            'Subscription creation failed. Please try again.'
          );
        }
      } catch (subscriptionError) {
        console.error('Subscription error:', subscriptionError);
        toast.showError(
          subscriptionError.message || 
          PAYMENT_NOTIFICATIONS.SUBSCRIPTION.ERROR
        );
        throw subscriptionError;
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.showError(
        error.message || 
        PAYMENT_NOTIFICATIONS.SUBSCRIPTION.UPGRADE_ERROR
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get Stripe price ID
  const getPriceId = (planName, isAnnual) => {
    const priceIds = {
      Basic: {
        monthly: 'price_1QL8zXP4XnLL74v7J9AEiZGD',
        annual: 'price_1QL90kP4XnLL74v7Opo8DQtM'
      },
      Professional: {
        monthly: 'price_1QL901P4XnLL74v79lxHKs1W',
        annual: 'price_1QL91HP4XnLL74v7nAaHOkPS'
      },
      Enterprise: {
        monthly: 'price_1QL90HP4XnLL74v7UXswWUzr',
        annual: 'price_1QL91fP4XnLL74v77CHQNSWb'
      }
    };

    return priceIds[planName][isAnnual ? 'annual' : 'monthly'];
  };

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 19.00,
      annualPrice: 190.00,
      features: [
        'Basic Resume Builder',
        '10 Job Applications/month',
        'Basic Job Matches',
        'Community Support',
        'Email Support'
      ],
      popular: false,
      active: currentPlan?.toLowerCase() === 'basic',
    },
    {
      name: 'Professional',
      monthlyPrice: 49.00,
      annualPrice: 390.00,
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
      active: currentPlan?.toLowerCase() === 'professional',
    },
    {
      name: 'Enterprise',
      monthlyPrice: 99.00,
      annualPrice: 1000.00,
      features: [
        'Everything in Professional',
        'Multiple Team Members',
        'Team Analytics',
        'Custom Branding',
        'API Access',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Features'
      ],
      popular: false,
      active: currentPlan?.toLowerCase() === 'enterprise',
    },
  ];

  // Add debug logging for subscription status
  useEffect(() => {
    console.log('Current Plan:', currentPlan);
    console.log('Plans Status:', plans.map(p => ({ 
      name: p.name, 
      active: p.active,
      matches: p.name.toLowerCase() === currentPlan?.toLowerCase()
    })));
  }, [currentPlan]);

  return (
    <section className="section-wrapper">
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
                  {plan.name === 'Professional' && 'Best for professionals'}
                  {plan.name === 'Enterprise' && 'For teams and businesses'}
                </p>
                <div className="price-tag">
                  {plan.monthlyPrice > 0 && <span>$</span>}
                  <AnimatePresence mode="wait">
                    <motion.span
                      className="amount"
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="period">{isAnnual ? '/year' : '/mo'}</span>
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
                  disabled={plan.active || isProcessing || isLoadingStatus}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {isLoadingStatus ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin" />
                      Loading...
                    </span>
                  ) : plan.active ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiCheck />
                      Current Plan
                    </span>
                  ) : isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiCreditCard />
                      Subscribe
                    </span>
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