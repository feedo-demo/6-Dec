/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { transformUserData, userOperations, createUserDataStructure } from './userManager';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { verifyTwoFactorCode } from './twoFactorAuth';
import { authenticator } from 'otplib';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempAuthCredentials, setTempAuthCredentials] = useState(null);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data to check 2FA status
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      // Check if user has 2FA enabled
      if (userData?.twoFactorAuth?.enabled) {
        // Store credentials temporarily and require 2FA
        setTempAuthCredentials(userCredential);
        setRequiresTwoFactor(true);
        return { requiresTwoFactor: true };
      }

      // If no 2FA, proceed with normal login
      const transformedData = transformUserData(userCredential.user, userData, userData?.isPending);
      setUser(transformedData);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verifyTwoFactor = async (code) => {
    try {
      if (!tempAuthCredentials) {
        throw new Error('No pending authentication');
      }

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', tempAuthCredentials.user.uid));
      const userData = userDoc.data();

      // Verify the code using otplib
      const isValid = authenticator.verify({
        token: code,
        secret: userData.twoFactorAuth.secret
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Complete the login process
      const transformedData = transformUserData(
        tempAuthCredentials.user, 
        userData, 
        userData?.isPending
      );
      
      setUser(transformedData);
      setRequiresTwoFactor(false);
      setTempAuthCredentials(null);

      return { success: true };
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  const signup = async (email, password, userData) => {
    try {
      // Create the auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile
      await updateFirebaseProfile(userCredential.user, {
        displayName: userData.displayName
      });

      // Create user data structure
      const userDataStructure = createUserDataStructure(userCredential.user, userData);
      
      // Create pending user document
      await userOperations.createPendingUser(userCredential.user.uid, userDataStructure);
      
      // Transform and set user data
      const transformedData = transformUserData(userCredential.user, userDataStructure, true);
      setUser({
        ...transformedData,
        isPending: true
      });

      return { 
        user: userCredential.user,
        success: true 
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const googleSignIn = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = await userOperations.getUserData(result.user.uid);
      console.log('Google Sign In - Raw Data:', { result, userData });

      if (!userData.data && !isSignUp) {
        await auth.signOut();
        throw new Error('No account found. Please sign up first.');
      }

      if (userData.data && isSignUp) {
        await auth.signOut();
        throw new Error('Account already exists. Please login instead.');
      }

      if (!userData.data && isSignUp) {
        // Create new pending user for signup
        const userDataStructure = createUserDataStructure(result.user, {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          provider: 'google'
        });
        
        await userOperations.createUserDocument(result.user.uid, userDataStructure, true);
        const transformedData = transformUserData(result.user, userDataStructure, true);
        console.log('Google Sign Up - New User Data:', transformedData);
        setUser(transformedData);
        return { isNewUser: true };
      }

      const transformedData = transformUserData(result.user, userData.data, userData.isPending);
      console.log('Google Sign In - Transformed Data:', transformedData);
      setUser(transformedData);
      return { isNewUser: false };
    } catch (error) {
      if (auth.currentUser) await auth.signOut();
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.profile?.authUid) throw new Error('No authenticated user');

    try {
      console.log('Updating profile with:', updates);
      
      // Special handling for work experience updates
      if (updates.profile?.workExperience) {
        // Transform dates to Firestore timestamps
        const workExperience = updates.profile.workExperience.map(exp => ({
          ...exp,
          // Only transform if the dates are not already Firestore timestamps
          startDate: exp.startDate instanceof Date ? exp.startDate : new Date(exp.startDate),
          endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate : new Date(exp.endDate)) : null
        }));

        updates = {
          ...updates,
          profile: {
            ...updates.profile,
            workExperience
          }
        };
      }

      const updatedData = await userOperations.updateUserProfile(user.profile.authUid, updates);
      
      // Transform the updated data to maintain consistent structure
      const newUserData = {
        ...user,
        ...updatedData,
        profile: {
          ...user.profile,
          ...updatedData.profile
        },
        settings: {
          ...user.settings,
          ...updatedData.settings
        }
      };
      
      console.log('Updated user data:', newUserData);
      setUser(newUserData);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user?.profile?.authUid) throw new Error('No authenticated user');

    try {
      await userOperations.deleteUserData(user.profile.authUid);
      await auth.currentUser.delete();
      setUser(null);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const { data, isPending } = await userOperations.getUserData(authUser.uid);
          console.log('Auth State Changed - Raw Data:', { 
            authUser: JSON.parse(JSON.stringify(authUser)), 
            data: JSON.parse(JSON.stringify(data)), 
            isPending 
          });

          if (data) {
            const userData = transformUserData(authUser, data, isPending);
            console.log('Transformed User Data:', userData);
            setUser({
              ...userData,
              isPending // Ensure isPending is set correctly
            });
          } else {
            console.log('No user data found, setting user to null');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
        }
      } else {
        console.log('No auth user, setting user to null');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    googleSignIn,
    signOut,
    updateProfile,
    deleteAccount,
    setUser,
    requiresTwoFactor,
    verifyTwoFactor
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 