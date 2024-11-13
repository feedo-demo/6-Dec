/**
 * BillingHistory Component
 * 
 * Features:
 * - Displays billing history in a list format
 * - Shows invoice details, amount, status
 * - Download invoice functionality
 * - Empty state message
 * - Responsive design
 * 
 * Props:
 * @param {Array} invoices - List of invoice records
 */

import React from 'react';
import { FiDollarSign, FiClock, FiDownload, FiInbox } from 'react-icons/fi';
import './BillingHistory.css';

const BillingHistory = ({ invoices = [] }) => {
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
      <h3 className="subsection-title">Billing History</h3>
      <div className="history-list">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="history-item">
            <div className="invoice-details">
              <span className="invoice-date">
                {new Date(invoice.date).toLocaleDateString()}
              </span>
              <span className="invoice-id">#{invoice.number}</span>
            </div>
            <div className="invoice-amount">
              <FiDollarSign className="amount-icon" />
              <span>{invoice.amount.toFixed(2)}</span>
            </div>
            <div className="invoice-status success">
              <FiClock className="status-icon" />
              <span>{invoice.status}</span>
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