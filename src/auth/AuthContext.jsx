/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, query, collection, where, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const signup = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update the user's display name in Firebase Auth
        await updateFirebaseProfile(userCredential.user, {
            displayName: `${userData.firstName} ${userData.lastName}`
        });
        
        const customUserId = createCustomUserId(userData.firstName, userData.lastName);
        
        const userDocRef = doc(db, 'users', customUserId);
        
        // Create user document with all required fields
        const userDocData = {
            ...userData,
            email,
            displayName: `${userData.firstName} ${userData.lastName}`, // Add display name to Firestore
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            provider: 'email',
            uid: customUserId,
            authUid: userCredential.user.uid,
            status: 'active',
            isEmailVerified: false
        };
        
        await setDoc(userDocRef, userDocData);

        // Update local user state
        setUser({
            ...userCredential.user,
            ...userDocData,
            isGoogleUser: false
        });

        return userCredential;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
  };

  const googleSignIn = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDocs = await getDocs(
        query(collection(db, 'users'), 
        where('authUid', '==', result.user.uid))
      );
      
      // If this is a login attempt and user doesn't exist
      if (!isSignUp && userDocs.empty) {
        await auth.signOut();
        setUser(null);
        throw new Error('No account found. Please sign up first.');
      }
      
      // If this is a signup attempt and user already exists
      if (isSignUp && !userDocs.empty) {
        await auth.signOut();
        setUser(null);
        throw new Error('Account already exists. Please login instead.');
      }
      
      // For new user signup
      if (isSignUp && userDocs.empty) {
        const nameParts = result.user.displayName?.split(' ') || ['', ''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        const customUserId = createCustomUserId(firstName, lastName);
        const userDocRef = doc(db, 'users', customUserId);
        
        // Create the user document with all required fields
        await setDoc(userDocRef, {
          firstName,
          lastName,
          email: result.user.email,
          phoneNumber: result.user.phoneNumber || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          provider: 'google',
          uid: customUserId,
          authUid: result.user.uid,
          photoURL: result.user.photoURL,
          isEmailVerified: result.user.emailVerified,
          status: 'active'
        });
        
        // Set the user state
        setUser({
          ...result.user,
          uid: customUserId,
          firstName,
          lastName,
          isGoogleUser: true
        });
        
        return { isNewUser: true };
      }
      
      // For existing user login
      const userData = userDocs.docs[0].data();
      setUser({
        ...result.user,
        ...userData,
        isGoogleUser: true
      });
      
      return { isNewUser: false };
      
    } catch (error) {
      // Make sure to sign out on error
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

  const updateProfile = async (updates, photoFile = null) => {
    if (!user) throw new Error('No authenticated user');

    try {
      // Handle photo upload if provided
      if (photoFile) {
        const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, photoFile);
        updates.photoURL = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile if there's a photoURL update
      if (updates.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          photoURL: updates.photoURL
        });
      }

      // Update Firestore document
      const userDocs = await getDocs(
        query(collection(db, 'users'), 
        where('authUid', '==', auth.currentUser.uid))
      );

      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), updates);

        // Update local user state
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
          // Get the user document using auth UID
          const userDocs = await getDocs(
            query(collection(db, 'users'), 
            where('authUid', '==', authUser.uid))
          );
          
          if (!userDocs.empty) {
            const userData = userDocs.docs[0].data();
            
            // Check if user is Google-authenticated
            const isGoogleUser = authUser.providerData?.[0]?.providerId === 'google.com';
            
            setUser({
              ...userData,
              displayName: authUser.displayName,
              email: authUser.email,
              photoURL: authUser.photoURL || userData.photoURL,
              uid: userData.uid,
              authUid: authUser.uid,
              isGoogleUser
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
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
    signOut,
    updateProfile,
    updateUserPassword,
    resetPassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Single export statement for both the hook and provider
export { useAuth, AuthProvider }; 