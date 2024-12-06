/**
 * Authentication and System Notifications
 * 
 * Centralizes all notification messages:
 * - Auth notifications
 * - Payment notifications
 * - Error messages
 * - Firebase error mappings
 */

export const AUTH_NOTIFICATIONS = {
  // Success/Info messages
  LOGIN: {
    SUCCESS: 'Successfully logged in',
    INVALID_2FA: 'Invalid verification code. Please try again.',
    GOOGLE_SUCCESS: 'Successfully signed in with Google',
    GOOGLE_NEW_USER: 'Please sign up with Google first.',
    LINKEDIN_COMING_SOON: 'LinkedIn integration coming soon'
  },
  LOGOUT: {
    SUCCESS: 'Successfully logged out. See you soon!'
  },
  SIGNUP: {
    SUCCESS: 'Account created successfully',
    GOOGLE_SUCCESS: 'Successfully signed up with Google',
    EXISTING_ACCOUNT: 'This Google account is already registered',
    FORM_ERRORS: 'Please fix all form errors before submitting'
  },

  // Firebase error code mappings
  FIREBASE_ERRORS: {
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or use "Forgot Password".',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/popup-closed-by-user': 'Sign in was cancelled',
    'auth/cancelled-popup-request': 'Sign in was cancelled',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Please use a different sign in method.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/weak-password': 'Password should be at least 8 characters',
    'auth/operation-not-allowed': 'This sign in method is not enabled.',
    'auth/requires-recent-login': 'Please sign in again to continue.'
  }
};

export const PAYMENT_NOTIFICATIONS = {
  CARD: {
    DELETE: {
      SUCCESS: 'Card deleted successfully',
      ERROR: 'Failed to delete card'
    },
    SET_DEFAULT: {
      SUCCESS: 'Default payment method updated',
      ERROR: 'Failed to set default payment method'
    },
    ADD: {
      SUCCESS: 'Card added successfully',
      ERROR: 'Failed to add card'
    }
  },
  BILLING: {
    LOAD_ERROR: 'Failed to load billing history'
  },
  SUBSCRIPTION: {
    SUCCESS: (plan, interval, amount) => 
      `Payment successful! You are now subscribed to the ${plan} plan (${interval}) - $${amount}`,
    ERROR: 'Failed to process subscription. Please try again.',
    UPGRADE_ERROR: 'Failed to upgrade plan. Please try again.',
    CANCEL: {
      SUCCESS: 'Subscription cancelled successfully',
      ERROR: 'Failed to cancel subscription'
    }
  }
};

// Error handler function
export const handleAuthError = (error) => {
  if (AUTH_NOTIFICATIONS.FIREBASE_ERRORS[error.code]) {
    return AUTH_NOTIFICATIONS.FIREBASE_ERRORS[error.code];
  }

  if (error.message) {
    return error.message;
  }

  return 'An error occurred. Please try again.';
}; 