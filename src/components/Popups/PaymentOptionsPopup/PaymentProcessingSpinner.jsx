/**
 * PaymentProcessingSpinner Component
 * 
 * Features:
 * - Specific spinner for payment processing
 * - Matches payment options styling
 * - Animated loading state
 */

import React from 'react';
import { FiLoader } from 'react-icons/fi';
import './PaymentProcessingSpinner.css';

const PaymentProcessingSpinner = () => {
  return (
    <div className="payment-processing-spinner">
      <FiLoader className="spinner-icon" />
      <span className="spinner-text">Processing payment</span>
    </div>
  );
};

export default PaymentProcessingSpinner; 