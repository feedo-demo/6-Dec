/**
 * Data Validation Helper Functions
 * 
 * Collection of validation functions for different types of user input
 */

export const validateUserData = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  password: (password) => {
    return password.length >= 8;
  },
  name: (name) => {
    return /^[a-zA-Z\s]{2,30}$/.test(name.trim());
  },
  phone: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^\d{10}$/.test(cleanPhone);
  }
}; 