/**
 * Password Validation Utilities
 * Provides consistent password validation and strength checking across the application
 */

// Password requirements with regex patterns
export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
  { id: 'special', label: 'One special character', regex: /[!@#$%^&*]/ }
];

/**
 * Validates a password against all requirements
 * @param {string} password - The password to validate
 * @returns {Object[]} Array of requirement objects with met status
 */
export const validatePassword = (password) => {
  return PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.regex.test(password)
  }));
};

/**
 * Calculates password strength score and label
 * @param {string} password - The password to check
 * @returns {Object} Object containing score (0-5) and label
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'None' };
  }

  const requirements = validatePassword(password);
  const metCount = requirements.filter(req => req.met).length;

  // Calculate score based on met requirements
  let score = metCount;
  let label = '';

  switch (score) {
    case 0:
      label = 'Very Weak';
      break;
    case 1:
      label = 'Weak';
      break;
    case 2:
      label = 'Fair';
      break;
    case 3:
      label = 'Good';
      break;
    case 4:
      label = 'Strong';
      break;
    case 5:
      label = 'Very Strong';
      break;
    default:
      label = 'None';
  }

  return { score, label };
};

/**
 * Checks if a password meets all requirements
 * @param {string} password - The password to validate
 * @returns {boolean} True if all requirements are met
 */
export const isPasswordValid = (password) => {
  const requirements = validatePassword(password);
  return requirements.every(req => req.met);
}; 