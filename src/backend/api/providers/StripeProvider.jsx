/**
 * Stripe Provider Component
 * 
 * Features:
 * - Initializes Stripe with public key from API
 * - Provides Stripe context to child components
 * - Handles Stripe Elements initialization
 * - Error handling for missing configuration
 */

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripeApi, getStripePromise } from '../stripe';
import { stripeConfig } from '../config/stripe.config';

const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true);
        
        if (!stripeConfig.isConfigured) {
          throw new Error('Stripe configuration is missing or invalid');
        }

        const promise = await getStripePromise();
        setStripePromise(promise);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        Loading payment system...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-semibold">Configuration Error</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">Please check your Stripe configuration.</p>
      </div>
    );
  }

  const options = {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 