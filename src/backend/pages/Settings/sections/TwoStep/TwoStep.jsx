/**
 * Two-Step Authentication Section Component
 * Features:
 * - Enable/disable two-step authentication
 * - QR code generation for authenticator apps
 * - Security settings configuration
 * - Firebase integration
 */

import React, { useState, useEffect } from 'react';
import { FiShield, FiSmartphone, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../../../../auth/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase/config';
import { authenticator } from 'otplib';
import { useToast } from '../../../../../components/Toast/ToastContext';
import './TwoStep.css';
import LoadingSpinner from '../../../../../components/LoadingSpinner/LoadingSpinner';
import SkeletonLoading from '../../../../../components/SkeletonLoading/SkeletonLoading';

const TwoStep = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  // Check if user signed up with Google
  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com' || user?.profile?.provider === 'google.com';

  // If Google user, show message instead of 2FA options
  if (isGoogleUser) {
    return (
      <div className="two-step-section">
        <h2 className="section-title">Two-Step Authentication</h2>
        <div className="two-step-content">
          <div className="security-status">
            <FiShield className="status-icon disabled" />
            <div className="status-info">
              <h3 className="status-title">Not Available for Google Sign-In</h3>
              <p className="status-description">
                Two-step authentication is not available for accounts using Google Sign-In as Google already provides its own security features.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch 2FA status on component mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        setLoading(true);
        if (user?.profile?.authUid) {
          const userDoc = await getDoc(doc(db, 'users', user.profile.authUid));
          const userData = userDoc.data();
          setIsEnabled(userData?.twoFactorAuth?.enabled || false);
          setSecretKey(userData?.twoFactorAuth?.secret || '');
        }
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
        toast.showError('Failed to fetch 2FA status');
      } finally {
        setLoading(false);
      }
    };

    fetch2FAStatus();
  }, [user?.profile?.authUid]);

  if (loading) {
    return <SkeletonLoading />;
  }

  const generateSecretKey = () => {
    return authenticator.generateSecret();
  };

  const handleSetupAuthenticator = () => {
    const newSecretKey = generateSecretKey();
    setSecretKey(newSecretKey);
    setShowQRCode(true);
    setError('');
  };

  const handleVerifyCode = async () => {
    try {
      setIsVerifying(true);
      setError('');
      
      if (!user?.profile?.authUid) {
        throw new Error('User not found');
      }

      // Verify the code using otplib
      const isValid = authenticator.verify({
        token: verificationCode,
        secret: secretKey
      });

      if (isValid) {
        // Update user's 2FA status in Firebase
        await updateDoc(doc(db, 'users', user.profile.authUid), {
          twoFactorAuth: {
            enabled: true,
            secret: secretKey,
            enabledAt: new Date()
          }
        });

        setIsEnabled(true);
        setShowQRCode(false);
        setVerificationCode('');
        toast.showSuccess('Two-step authentication has been enabled successfully');
      } else {
        setError('Invalid verification code. Please try again.');
        toast.showError('Invalid verification code');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Failed to verify code. Please try again.');
      toast.showError('Failed to enable two-step authentication');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      if (!user?.profile?.authUid) {
        throw new Error('User not found');
      }

      await updateDoc(doc(db, 'users', user.profile.authUid), {
        twoFactorAuth: {
          enabled: false,
          secret: null,
          enabledAt: null
        }
      });

      setIsEnabled(false);
      setSecretKey('');
      toast.showSuccess('Two-step authentication has been disabled');
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError('Failed to disable 2FA. Please try again.');
      toast.showError('Failed to disable two-step authentication');
    }
  };

  const qrCodeUrl = `otpauth://totp/Feedo:${user?.profile?.email}?secret=${secretKey}&issuer=Feedo`;

  const NotificationToggle = ({ enabled, onClick }) => (
    <button 
      onClick={onClick}
      className={`toggle-button ${enabled ? 'active' : ''}`}
      aria-checked={enabled}
      role="switch"
    />
  );

  return (
    <div className="two-step-section">
      <h2 className="section-title">Two-Step Authentication</h2>
      
      <div className="two-step-content">
        <div className="security-status">
          <FiShield className={`status-icon ${isEnabled ? 'enabled' : 'disabled'}`} />
          <div className="status-info">
            <h3 className="status-title">Two-Step Authentication is {isEnabled ? 'Enabled' : 'Disabled'}</h3>
            <p className="status-description">
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
          </div>
          <NotificationToggle 
            enabled={isEnabled}
            onClick={() => isEnabled ? handleDisable2FA() : handleSetupAuthenticator()}
          />
        </div>

        {!isEnabled && (
          <div className="authentication-options">
            <div className="auth-option">
              <FiSmartphone className="option-icon" />
              <div className="option-info">
                <h4>Authenticator App</h4>
                <p>Use an authenticator app to generate verification codes</p>
                <button 
                  className="setup-button"
                  onClick={handleSetupAuthenticator}
                >
                  Set up authenticator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRCode && (
            <motion.div
              className="qr-code-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="qr-code-content"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowQRCode(false)}
                >
                  <FiX />
                </button>

                <h3>Set Up Authenticator</h3>
                <div className="qr-code-steps">
                  <p>1. Install an authenticator app like Google Authenticator or Authy</p>
                  <p>2. Scan this QR code with your authenticator app</p>
                  <div className="qr-code-container">
                    <QRCodeSVG value={qrCodeUrl} size={200} level="H" />
                  </div>
                  <p>3. Enter the 6-digit code from your authenticator app</p>
                  <div className="verification-input">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    />
                    {error && <span className="error-message">{error}</span>}
                  </div>
                  <button 
                    className="verify-btn"
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="xs" color="text-white" isBackend={true} />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      'Verify and Enable'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TwoStep; 