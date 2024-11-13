/**
 * Payment Section Index
 * 
 * Features:
 * - Wraps Payment component with required providers
 * - Handles toast notifications
 * - Manages Stripe integration
 */

import React from 'react';
import { ToastProvider } from '../../../../components/Toast/ToastContext';
import Payment from './Payment';

const PaymentSection = () => {
  return (
    <ToastProvider>
      <Payment />
    </ToastProvider>
  );
};

export default PaymentSection; 