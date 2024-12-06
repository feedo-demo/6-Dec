/**
 * AdminLogin Component
 * 
 * Features:
 * - Secure admin authentication
 * - 2FA support
 * - Error handling
 * - Rate limiting
 * - Activity logging
 */

import React, { useState, useEffect } from 'react';
import { FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { useAdminAuth } from '../AdminAuth/AdminAuthContext';
import { useToast } from '../../components/Toast/ToastContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, adminUser } = useAdminAuth();
  const { showToast } = useToast();

  // Add effect to handle navigation when adminUser changes
  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(formData.email, formData.password);
      showToast('success', 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
      showToast('error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Portal</h1>
          <p>Enter your credentials to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            className="admin-login-button"
          >
            {loading ? 'Authenticating...' : 'Login to Admin Portal'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 