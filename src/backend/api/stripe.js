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

import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';
import { stripeConfig } from './config/stripe.config';

// Initialize Stripe instance
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
});

// Initialize Stripe client-side promise
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
      if (!stripe) {
        throw new Error('Stripe has not been initialized');
      }

      // In production, you'd fetch this from your database
      let customer = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customer.data.length) {
        return customer.data[0];
      }

      customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
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

      if (!stripe) {
        throw new Error('Stripe has not been initialized');
      }

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

  // Process payment
  async processPayment(customerId, amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error in processPayment:', error);
      throw error;
    }
  },

  // Create a subscription
  async createSubscription(customerId, priceId) {
    try {
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Create an invoice for the subscription
      const invoice = await stripe.invoices.create({
        customer: customerId,
        subscription: subscription.id,
        auto_advance: true, // Auto-finalize the draft invoice
      });

      // Pay the invoice immediately
      await stripe.invoices.pay(invoice.id);

      return subscription;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw new Error('Failed to create subscription');
    }
  },

  // Get billing history
  async getBillingHistory(customerId) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 10,
        status: 'paid',
      });

      return invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        invoice_pdf: invoice.invoice_pdf,
        number: invoice.number
      }));
    } catch (error) {
      console.error('Error in getBillingHistory:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscriptionDetails(customerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        expand: ['data.plan.product'],
      });

      if (!subscriptions.data.length) {
        return null;
      }

      const subscription = subscriptions.data[0];
      return {
        id: subscription.id,
        planName: subscription.plan.product.name,
        amount: subscription.plan.amount / 100,
        interval: subscription.plan.interval,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };
    } catch (error) {
      console.error('Error in getSubscriptionDetails:', error);
      throw error;
    }
  },

  // List customer's invoices
  async listInvoices(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100, // Adjust as needed
      });

      return invoices.data;
    } catch (error) {
      console.error('Error in listInvoices:', error);
      throw new Error('Failed to list invoices');
    }
  }
}; 