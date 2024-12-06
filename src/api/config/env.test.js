/**
 * Environment Variables Test
 * 
 * This file helps verify that environment variables are being loaded correctly
 */

export const testEnvironmentVariables = () => {
  const variables = {
    STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.REACT_APP_STRIPE_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log('Environment Variables Test:', {
    hasPublicKey: !!variables.STRIPE_PUBLIC_KEY,
    publicKeyPrefix: variables.STRIPE_PUBLIC_KEY?.substring(0, 7),
    hasSecretKey: !!variables.STRIPE_SECRET_KEY,
    secretKeyPrefix: variables.STRIPE_SECRET_KEY?.substring(0, 7),
    environment: variables.NODE_ENV,
  });

  return variables;
}; 