/**
 * BillingHistory Component
 * 
 * Features:
 * - Displays billing history in a list format
 * - Shows invoice details, amount, status
 * - Download invoice functionality
 * - Empty state message
 * - Clear history option
 * - Responsive design
 * 
 * Props:
 * @param {Array} invoices - List of invoice records
 * @param {Function} onClearHistory - Handler for clearing history
 */

import React from 'react';
import { FiDollarSign, FiCheck, FiDownload, FiInbox, FiTrash2 } from 'react-icons/fi';
import SkeletonLoading from '../SkeletonLoading/SkeletonLoading';
import './BillingHistory.css';

const BillingHistory = ({ invoices = [], onClearHistory, loading = false }) => {
  // Filter out $0 invoices
  const filteredInvoices = invoices.filter(invoice => invoice.amount > 0);

  // Helper function to capitalize status
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Add this helper function at the top of the component
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Format date like "5 Jan, 2024"
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Format time like "2:30 PM"
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  // Add this helper function to format the amount
  const formatAmount = (amount) => {
    // If amount has no decimal places or only zeros after decimal
    if (amount % 1 === 0) {
      return amount.toFixed(0); // Return without decimal places
    }
    return amount.toFixed(2); // Keep decimals if they exist
  };

  if (loading) {
    return <SkeletonLoading />;
  }

  if (!Array.isArray(invoices)) {
    console.error('Invalid invoices data:', invoices);
    return (
      <div className="billing-history">
        <h3 className="subsection-title">Billing History</h3>
        <div className="empty-history">
          <FiInbox className="empty-icon" />
          <p className="empty-text">Unable to load billing history</p>
          <p className="empty-subtext">Please try again later</p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="billing-history">
        <h3 className="subsection-title">Billing History</h3>
        <div className="empty-history">
          <FiInbox className="empty-icon" />
          <p className="empty-text">No billing history available yet</p>
          <p className="empty-subtext">Your payment history will appear here once you make a purchase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-history">
      <div className="history-header">
        <h3 className="subsection-title">Billing History</h3>
        {filteredInvoices.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="clear-history-btn"
          >
            <FiTrash2 className="clear-icon" />
            Clear History
          </button>
        )}
      </div>
      <div className="history-list">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="history-item">
            <div className="invoice-details">
              <span className="invoice-date">
                {formatDate(invoice.date)}
              </span>
              <span className="invoice-id">#{invoice.number}</span>
            </div>
            <div className="invoice-amount">
              <FiDollarSign className="amount-icon" />
              <span>{formatAmount(invoice.amount)}</span>
            </div>
            <div className="invoice-status success">
              <FiCheck className="status-icon" />
              <span>Paid</span>
            </div>
            <a 
              href={invoice.invoice_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn"
            >
              <FiDownload />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingHistory; 