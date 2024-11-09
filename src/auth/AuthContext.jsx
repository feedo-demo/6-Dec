/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, query, collection, where, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { createCustomUserId } from '../backend/constants/profileData';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AuthContext = createContext();

// Create the context hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;

      // Check profile type collections
      const profileTypes = ['entrepreneur', 'student', 'jobseeker', 'company'];
      let userData = null;

      for (const profileType of profileTypes) {
        const userDoc = await getDoc(doc(db, profileType, authUser.uid));
        if (userDoc.exists()) {
          userData = {
            ...authUser,
            ...userDoc.data(),  // Get all user data
            profileType,        // Add the profile type
            displayName: authUser.displayName || userDoc.data().displayName,
            isEmailVerified: authUser.emailVerified,
            provider: authUser.providerData[0]?.providerId || 'email'
          };
          break;
        }
      }

      // Check if user is pending
      if (!userData) {
        const pendingDoc = await getDoc(doc(db, 'pending_users', authUser.uid));
        if (pendingDoc.exists()) {
          userData = {
            ...authUser,
            ...pendingDoc.data(),
            isPending: true
          };
        }
      }

      // Update user state if we found data
      if (userData) {
        setUser(userData);
      } else {
        // If no user data found, sign out and throw error
        await auth.signOut();
        throw new Error('User data not found. Please try again.');
      }

      return userCredential;
    } catch (error) {
      // If Firebase auth failed, throw the original error
      if (error.code) {
        throw error;
      }
      // For our custom errors, wrap them with a code
      throw {
        code: 'auth/user-data-not-found',
        message: error.message
      };
    }
  };

  const signup = async (email, password, userData) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with displayName if provided
      if (userData.displayName) {
        await updateFirebaseProfile(user, {
          displayName: userData.displayName
        });
      }

      // Create pending user document in Firestore
      const pendingUserRef = doc(db, 'pending_users', user.uid);
      await setDoc(pendingUserRef, {
        authUid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isEmailVerified: user.emailVerified,
        status: 'pending',
        provider: 'email'
      });

      // Update local user state
      setUser({
        ...userData,
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName,
        isPending: true,
        isGoogleUser: false
      });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const googleSignIn = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);

      // For signup flow, first check pending_users
      if (isSignUp) {
        const pendingDoc = await getDoc(doc(db, 'pending_users', result.user.uid));
        if (pendingDoc.exists()) {
          // User is in the middle of signup process
          setUser({
            ...result.user,
            ...pendingDoc.data(),
            isPending: true
          });
          return { isNewUser: true };
        }
      }
      
      // Check if user exists in any profile type collection
      const profileTypes = ['entrepreneur', 'student', 'jobseeker', 'company'];
      let existingUserData = null;

      for (const profileType of profileTypes) {
        const userDoc = await getDoc(doc(db, profileType, result.user.uid));
        if (userDoc.exists()) {
          existingUserData = { 
            ...userDoc.data().profile,
            ...userDoc.data().settings,
            profileType 
          };
          break;
        }
      }

      // Handle signup vs login flows
      if (isSignUp) {
        if (existingUserData) {
          // User already exists, should login instead
          await auth.signOut();
          setUser(null);
          throw new Error('Account already exists. Please login instead.');
        }

        // Create new pending user
        const pendingUserRef = doc(db, 'pending_users', result.user.uid);
        
        // Fix: Better name splitting logic
        const fullName = result.user.displayName || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        // Fix: Join the rest of the name parts for lastName
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await setDoc(pendingUserRef, {
          authUid: result.user.uid,
          createdAt: serverTimestamp(),
          email: result.user.email,
          firstName: firstName,
          lastName: lastName,
          isEmailVerified: result.user.emailVerified,
          lastLoginAt: serverTimestamp(),
          phoneNumber: result.user.phoneNumber || '',
          photoURL: result.user.photoURL,
          provider: 'google',
          status: 'pending'
        });

        setUser({
          ...result.user,
          isPending: true
        });

        return { isNewUser: true };
      } else {
        // Login flow
        if (!existingUserData) {
          await auth.signOut();
          setUser(null);
          throw new Error('No account found. Please sign up first.');
        }

        setUser({
          ...result.user,
          ...existingUserData
        });

        return { isNewUser: false };
      }
      
    } catch (error) {
      if (auth.currentUser) {
        await auth.signOut();
      }
      setUser(null);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!auth.currentUser) throw new Error('No authenticated user');

    try {
      // If updating Firebase auth profile properties
      if (updates.displayName || updates.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Handle profile type updates
      if (updates.profileType) {
        // Update local state immediately
        setUser(prev => ({
          ...prev,
          ...updates,
          isPending: false
        }));
        return true;
      }

      // For other profile updates...
      const profileType = user?.profileType;
      if (profileType) {
        const userRef = doc(db, profileType, auth.currentUser.uid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setUser(prev => ({
          ...prev,
          ...updates
        }));
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    await updatePassword(auth.currentUser, newPassword);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No authenticated user');

    try {
      // Get user document
      const userDocs = await getDocs(
        query(collection(db, 'users'), 
        where('authUid', '==', auth.currentUser.uid))
      );

      if (!userDocs.empty) {
        // Delete user document
        await deleteDoc(doc(db, 'users', userDocs.docs[0].id));
      }

      // Delete Firebase auth user
      await auth.currentUser.delete();
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Check pending collection first
          const pendingDoc = await getDoc(doc(db, 'pending_users', authUser.uid));
          if (pendingDoc.exists()) {
            setUser({
              ...authUser,
              ...pendingDoc.data(),
              isPending: true
            });
            setLoading(false);
            return;
          }

          // If not pending, check all profile type collections
          const profileTypes = ['entrepreneur', 'student', 'jobseeker', 'company'];
          let userData = null;

          for (const profileType of profileTypes) {
            const userDoc = await getDoc(doc(db, profileType, authUser.uid));
            if (userDoc.exists()) {
              const docData = userDoc.data();
              userData = {
                ...authUser,
                profileType,
                // Ensure we maintain the nested structure while also providing top-level access
                profile: docData.profile || {},
                settings: docData.settings || {},
                // Add flattened fields for backward compatibility
                firstName: docData.profile?.firstName || docData.firstName,
                lastName: docData.profile?.lastName || docData.lastName,
                displayName: authUser.displayName || docData.profile?.displayName || `${docData.profile?.firstName} ${docData.profile?.lastName}`,
                phoneNumber: docData.profile?.phoneNumber || docData.phoneNumber,
                isEmailVerified: authUser.emailVerified,
                provider: authUser.providerData[0]?.providerId || 'email'
              };
              break;
            }
          }

          if (userData) {
            console.log('Setting user data:', userData); // Debug log
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
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
    updateUserPassword,
    resetPassword,
    deleteAccount,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Single export statement for both the hook and provider
export { useAuth, AuthProvider }; 