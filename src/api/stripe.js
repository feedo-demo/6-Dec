/**
 * Stripe API Handler
 * 
 * Features:
 * - Secure payment method management
 * - Customer creation and management
 * - Payment processing
 * - Error handling
 * - Webhook processing
 */

import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { stripeConfig } from './config/stripe.config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

// Initialize Stripe instance with server-side secret key
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
});

// Verify database connection
const verifyDbConnection = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return true;
};

// Initialize Stripe client-side promise with public key
export const getStripePromise = () => {
  if (!stripeConfig.publicKey) {
    console.error('Stripe public key is missing');
    return Promise.reject(new Error('Stripe is not properly configured'));
  }

  try {
    return loadStripe(stripeConfig.publicKey);
  } catch (error) {
    console.error('Error loading Stripe:', error);
    throw error;
  }
};

/**
 * Verifies that a user owns a Stripe customer ID
 */
const verifyCustomerOwnership = async (userId, customerId) => {
  try {
    verifyDbConnection();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get the customer mapping from Firebase
    const customerRef = doc(db, 'stripe_customers', userId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer mapping not found');
    }

    // Verify the customer ID matches
    if (customerDoc.data().customerId !== customerId) {
      throw new Error('Unauthorized access to customer data');
    }

    return true;
  } catch (error) {
    console.error('Customer verification error:', error);
    throw new Error('Unauthorized access');
  }
};

export const stripeApi = {
  // Check if Stripe is properly configured
  isConfigured: () => stripeConfig.isConfigured,

  // Get Stripe configuration status
  getConfigStatus: () => ({
    isConfigured: stripeConfig.isConfigured,
    hasPublicKey: Boolean(stripeConfig.publicKey),
    hasSecretKey: Boolean(stripeConfig.secretKey)
  }),

  // Create or get Stripe customer
  async getOrCreateCustomer(userId, email) {
    try {
      verifyDbConnection();

      if (!userId || !email) {
        throw new Error('User ID and email are required');
      }

      if (!stripe) {
        throw new Error('Stripe has not been initialized');
      }

      // First check if we have a mapping in Firebase
      const customerRef = doc(db, 'stripe_customers', userId);
      const customerDoc = await getDoc(customerRef);

      if (customerDoc.exists()) {
        // Get the customer from Stripe using the stored ID
        const customer = await stripe.customers.retrieve(customerDoc.data().customerId);
        return customer;
      }

      // If no mapping exists, create a new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      // Store the mapping in Firebase
      await setDoc(customerRef, {
        customerId: customer.id,
        email,
        createdAt: serverTimestamp()
      });

      return customer;
    } catch (error) {
      console.error('Error in getOrCreateCustomer:', error);
      throw new Error('Failed to create or get customer');
    }
  },

  // Add payment method to customer
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error in addPaymentMethod:', error);
      throw error;
    }
  },

  // List customer's payment methods
  async listPaymentMethods(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error in listPaymentMethods:', error);
      throw new Error('Failed to list payment methods');
    }
  },

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    try {
      // Get the payment method to verify ownership
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership of the customer this payment method belongs to
      await verifyCustomerOwnership(user.uid, paymentMethod.customer);

      await stripe.paymentMethods.detach(paymentMethodId);
      return { success: true };
    } catch (error) {
      console.error('Error in deletePaymentMethod:', error);
      throw error;
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      // First attach the payment method to the customer if not already attached
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Then set it as the default payment method
      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Verify the update was successful
      if (customer.invoice_settings.default_payment_method !== paymentMethodId) {
        throw new Error('Failed to update default payment method');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in setDefaultPaymentMethod:', error);
      throw error;
    }
  },

  // Get billing history
  async getBillingHistory(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      // Get all invoices for the customer
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 10,
        status: 'paid',
        expand: ['data.subscription', 'data.subscription.plan']
      });

      // Map and format the invoices
      const formattedInvoices = invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        invoice_pdf: invoice.hosted_invoice_url,
        number: invoice.number,
        description: invoice.subscription ? 
          `${invoice.subscription.plan?.nickname || 'Subscription'} - ${invoice.subscription.plan?.interval}ly` : 
          'One-time payment'
      }));

      return formattedInvoices;
    } catch (error) {
      console.error('Error in getBillingHistory:', error);
      throw error;
    }
  },

  // Get customer details
  async getCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['invoice_settings.default_payment_method']
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  },

  // Clear billing history
  async clearBillingHistory(customerId) {
    try {
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      // Get all invoices for the customer
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100,
      });

      // Delete each invoice
      for (const invoice of invoices.data) {
        try {
          if (invoice.status !== 'void') {
            await stripe.invoices.voidInvoice(invoice.id);
          }
        } catch (error) {
          console.error(`Failed to void invoice ${invoice.id}:`, error);
        }
      }

      // Mark all invoices as deleted in customer metadata
      await stripe.customers.update(customerId, {
        metadata: {
          invoices_cleared: 'true',
          cleared_at: new Date().toISOString()
        }
      });

      return [];
    } catch (error) {
      console.error('Error in clearBillingHistory:', error);
      throw new Error('Failed to clear billing history');
    }
  },

  // Get subscription details
  async getSubscriptionDetails(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      // Get customer's subscriptions with proper expand paths
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        expand: ['data.default_payment_method', 'data.items.data.price']
      });

      if (!subscriptions.data.length) {
        return null;
      }

      const subscription = subscriptions.data[0];
      const price = subscription.items.data[0].price;
      
      // Get the product details separately
      const product = await stripe.products.retrieve(price.product);
      
      console.log('Raw subscription data:', {
        subscription,
        price,
        product,
        planName: product.name
      });

      return {
        id: subscription.id,
        planName: product.name,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        interval: subscription.items.data[0].price.recurring.interval,
        amount: subscription.items.data[0].price.unit_amount / 100,
        currency: subscription.items.data[0].price.currency,
        defaultPaymentMethod: subscription.default_payment_method
      };
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(customerId, priceId, paymentMethodId) {
    try {
      if (!customerId || !priceId) {
        throw new Error('Customer ID and price ID are required');
      }

      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      await verifyCustomerOwnership(user.uid, customerId);

      // Get the customer to check for default payment method
      const customer = await stripe.customers.retrieve(customerId);
      
      // Ensure the payment method is attached and set as default
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
        
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      } else if (!customer.invoice_settings.default_payment_method) {
        throw new Error('No default payment method found');
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        collection_method: 'charge_automatically'
      });

      // Handle the subscription status
      if (subscription.status === 'incomplete') {
        const paymentIntent = subscription.latest_invoice.payment_intent;
        
        if (paymentIntent.status === 'requires_payment_method') {
          throw new Error('Payment failed. Please check your card details and try again.');
        }
        
        // Wait for the payment to be confirmed
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
        
        if (confirmedPaymentIntent.status === 'succeeded') {
          // Refresh the subscription to get the latest status
          const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id);
          return { subscription: updatedSubscription };
        } else {
          throw new Error('Payment confirmation failed');
        }
      }

      return { subscription };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      if (!subscriptionId || !newPriceId) {
        throw new Error('Subscription ID and new price ID are required');
      }

      // Get the subscription to verify customer
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership of the customer this subscription belongs to
      await verifyCustomerOwnership(user.uid, subscription.customer);

      // Update the subscription
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      // Get the subscription to verify customer
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership of the customer this subscription belongs to
      await verifyCustomerOwnership(user.uid, subscription.customer);

      if (cancelAtPeriodEnd) {
        // Cancel at period end
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
        return updatedSubscription;
      } else {
        // Cancel immediately
        const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
        return canceledSubscription;
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      // Get the subscription to verify customer
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get userId from the current context
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership of the customer this subscription belongs to
      await verifyCustomerOwnership(user.uid, subscription.customer);

      // Remove the cancellation at period end
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  },
}; 