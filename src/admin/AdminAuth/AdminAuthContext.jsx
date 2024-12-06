/**
 * AdminAuthContext - Simplified Version
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '../../components/Toast/ToastContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.email === 'admin@feedo.ai') {
        setAdminUser({
          uid: user.uid,
          email: user.email,
          role: 'admin'
        });
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      if (email !== 'admin@feedo.ai') {
        throw new Error('Unauthorized access. Not an admin user.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAdminUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'admin'
      });

      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const adminLogout = async () => {
    try {
      await auth.signOut();
      setAdminUser(null);
    } catch (error) {
      console.error('Admin logout error:', error);
      throw error;
    }
  };

  const value = {
    adminUser,
    loading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 