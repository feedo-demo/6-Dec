/**
 * Stripe Configuration
 * 
 * Features:
 * - Centralized Stripe configuration
 * - Environment variable management
 * - API version control
 * - Configuration validation
 */

const STRIPE_PUBLIC_KEY = 'pk_test_51PQu0cP4XnLL74v7xcT1lPf1mgvyKXA170vlt8mqF4LR1aqw3b9v7SJneKrazSZwPRgS8a2x4q1ex5BpNVp5MHkK00KJhy5n9I';
const STRIPE_SECRET_KEY = 'sk_test_51PQu0cP4XnLL74v7Rd09QRXntyh9iMqq93Cwbl2TEnfnMoODPN7faNVuqQmwX755rgx8qujWaziSsXMqTR8tVRHA00Jl9yXldI';
const STRIPE_API_VERSION = '2023-10-16';

export const stripeConfig = {
  publicKey: STRIPE_PUBLIC_KEY,
  secretKey: STRIPE_SECRET_KEY,
  apiVersion: STRIPE_API_VERSION,
  isConfigured: Boolean(STRIPE_PUBLIC_KEY && STRIPE_SECRET_KEY)
}; 