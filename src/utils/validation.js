export const validateUserData = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  password: (password) => {
    return password.length >= 8;
  },
  // Add more validation methods
}; 