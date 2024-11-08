export const handleAuthError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account already exists with this email',
    // Add more error mappings
  };

  return errorMessages[error.code] || error.message;
}; 