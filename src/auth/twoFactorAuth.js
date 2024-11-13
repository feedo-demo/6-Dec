/**
 * Two-Factor Authentication Service
 * 
 * Features:
 * - Verify 2FA codes
 * - Generate secret keys
 * - Enable/disable 2FA
 * - QR code generation
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authenticator } from 'otplib';

// Verify 2FA code
export const verifyTwoFactorCode = async (userId, code) => {
  try {
    // Get user's 2FA settings from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData?.twoFactorAuth?.secret) {
      throw new Error('Two-factor authentication is not set up');
    }

    // Verify the code using otplib
    const isValid = authenticator.verify({
      token: code,
      secret: userData.twoFactorAuth.secret
    });

    return isValid;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    throw error;
  }
};

// Generate new secret key
export const generateSecretKey = () => {
  return authenticator.generateSecret();
};

// Enable 2FA for a user
export const enableTwoFactor = async (userId, secret) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      twoFactorAuth: {
        enabled: true,
        secret: secret,
        enabledAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
};

// Disable 2FA for a user
export const disableTwoFactor = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      twoFactorAuth: {
        enabled: false,
        secret: null,
        enabledAt: null
      }
    });
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
}; 