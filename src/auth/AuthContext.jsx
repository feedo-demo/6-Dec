/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile, OAuthProvider } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { transformUserData, userOperations, createUserDataStructure } from './userManager';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { verifyTwoFactorCode } from './twoFactorAuth';
import { authenticator } from 'otplib';
import { useToast } from '../components/Toast/ToastContext';
import { AUTH_NOTIFICATIONS, handleAuthError } from '../components/Toast/toastnotifications';

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
  const { showToast } = useToast();

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data to check 2FA status
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      // Check if user has 2FA enabled
      if (userData?.twoFactorAuth?.enabled) {
        setTempAuthCredentials(userCredential);
        setRequiresTwoFactor(true);
        return { requiresTwoFactor: true };
      }

      // If no 2FA, proceed with normal login
      const transformedData = transformUserData(userCredential.user, userData, userData?.isPending);
      setUser(transformedData);
      
      showToast(AUTH_NOTIFICATIONS.LOGIN.SUCCESS, 'success');
      return { 
        user: transformedData,
        success: true 
      };
    } catch (error) {
      console.error('Login error:', error);
      showToast(handleAuthError(error), 'error');
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

      showToast(AUTH_NOTIFICATIONS.LOGIN.SUCCESS, 'success');
      return { 
        success: true,
        user: transformedData 
      };
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

      // Create user data structure with explicit userType
      const userDataStructure = createUserDataStructure(userCredential.user, {
        ...userData,
        userType: 'pending' // Explicitly set userType
      });
      
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

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google sign in result:', {
        user,
        photoURL: user.photoURL,
        providerData: user.providerData
      });
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Split display name into first and last name
        const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create initial data object with explicit provider and photo URL
        const initialData = {
          profile: {
            firstName,
            lastName,
            displayName: user.displayName || '',
            photoURL: user.photoURL,
            provider: 'google.com',
            email: user.email
          },
          isPending: true
        };

        // Create user data structure
        const userData = createUserDataStructure(user, initialData);
        
        // Create pending user document instead of direct creation
        await userOperations.createPendingUser(user.uid, userData);
        
        // Transform and set user state
        const transformedData = transformUserData(user, userData, true);
        setUser({
          ...transformedData,
          isPending: true
        });
        
        return {
          user: transformedData,
          isNewUser: true
        };
      }
      
      // Existing user - update photo URL if needed
      const userData = userDoc.data();
      if (user.photoURL && user.photoURL !== userData.profile?.photoURL) {
        await updateDoc(doc(db, 'users', user.uid), {
          'profile.photoURL': user.photoURL
        });
        userData.profile.photoURL = user.photoURL;
      }
      
      const transformedData = transformUserData(user, userData, userData?.isPending);
      setUser(transformedData);
      
      return {
        user: transformedData,
        isNewUser: false
      };
      
    } catch (error) {
      console.error('Google sign in error:', error);
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error(AUTH_NOTIFICATIONS.ERRORS.GOOGLE_POPUP_CLOSED);
      }
      throw error;
    }
  };

  const linkedInSignIn = async (isSignUp = false) => {
    try {
      const provider = new OAuthProvider('linkedin.com');
      provider.addScope('r_emailaddress');
      provider.addScope('r_liteprofile');
      
      const result = await signInWithPopup(auth, provider);
      
      // Get or create user data
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();
      
      // If it's a new user and signing up
      if (!userData && isSignUp) {
        // Create user data structure
        const userDataStructure = createUserDataStructure(result.user, {
          provider: 'linkedin'
        });
        
        // Create pending user document
        await userOperations.createPendingUser(result.user.uid, userDataStructure);
        
        const transformedData = transformUserData(result.user, userDataStructure, true);
        setUser({
          ...transformedData,
          isPending: true
        });
        
        return { isNewUser: true, user: result.user };
      }
      
      // Existing user or sign in
      const transformedData = transformUserData(result.user, userData, userData?.isPending);
      setUser(transformedData);
      return { isNewUser: false, user: result.user };
    } catch (error) {
      console.error('LinkedIn sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      showToast(AUTH_NOTIFICATIONS.LOGOUT.SUCCESS, 'success');
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.profile?.authUid) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.profile.authUid);
      
      // Get current user data
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.data();

      // Merge profile sections data instead of overwriting
      const updatedProfileSections = {
        ...currentData.profileSections,
        ...(updates.profileSections || {})
      };

      const updateData = {
        ...updates,
        profileSections: updatedProfileSections,
        lastUpdated: serverTimestamp()
      };

      // Remove profileData from the update if it exists
      delete updateData.profileData;

      await updateDoc(userRef, updateData);

      // Update local user state with merged data
      const updatedUser = {
        ...user,
        profileSections: updatedProfileSections
      };

      // Remove profileData from local state if it exists
      delete updatedUser.profileData;

      setUser(updatedUser);
      return updatedUser;
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

  const updateUserType = async (selectedType) => {
    if (!user?.profile?.authUid) throw new Error('No authenticated user');

    try {
      const updatedData = await userOperations.updateUserType(user.profile.authUid, selectedType);
      
      // Transform and update local user state
      const transformedData = transformUserData(auth.currentUser, updatedData, false);
      setUser(transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Error updating user type:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return null;

    try {
      const { data, isPending } = await userOperations.getUserData(auth.currentUser.uid);
      if (data) {
        // For Google users, always check for photoURL updates
        if (data.profile?.provider === 'google.com' && auth.currentUser.photoURL) {
          // Get fresh token to ensure photoURL is current
          const freshPhotoURL = await auth.currentUser.getIdToken(true)
            .then(() => auth.currentUser.photoURL);
          
          // Update if photoURL has changed
          if (freshPhotoURL !== data.profile.photoURL) {
            console.log('Updating Google user photo URL:', {
              old: data.profile.photoURL,
              new: freshPhotoURL
            });
            
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'profile.photoURL': freshPhotoURL
            });
            data.profile.photoURL = freshPhotoURL;
          }
        }
        
        const userData = transformUserData(auth.currentUser, data, isPending);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const { data, isPending } = await userOperations.getUserData(authUser.uid);
          
          if (data) {
            const userData = transformUserData(authUser, data, isPending);
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
        }
      } else {
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
    linkedInSignIn,
    signOut,
    updateProfile,
    deleteAccount,
    setUser,
    requiresTwoFactor,
    verifyTwoFactor,
    updateUserType,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 