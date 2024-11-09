/**
 * Firestore Database Schema Documentation
 * 
 * This file documents the structure of the Firestore database collections and documents.
 * Note: This is for documentation purposes and doesn't affect the actual database.
 * 
 * Database Structure Overview:
 * - entrepreneur/           // Collection for entrepreneur profiles and data
 * - student/               // Collection for student profiles and data
 * - jobseeker/            // Collection for job seeker profiles and data
 * - company/             // Collection for company profiles and data
 */

const firestoreSchema = {
  // Base profile structure that all profile types will follow
  baseProfile: {
    profile: {
      authUid: 'string',
      createdAt: 'timestamp',
      email: 'string',
      lastName: 'string',  // Move lastName before firstName
      firstName: 'string',
      isEmailVerified: 'boolean',
      lastLoginAt: 'timestamp',
      phoneNumber: 'string',
      photoURL: 'string?',
      provider: 'string'
    },
    status: 'string',
    settings: {
      notifications: 'boolean',
      emailPreferences: {
        marketing: 'boolean',
        updates: 'boolean',
        opportunities: 'boolean'
      },
      theme: 'string'
    }
  },

  // Each collection follows the same base structure
  entrepreneur: {
    [userId]: {/* extends baseProfile */}
  },

  student: {
    [userId]: {/* extends baseProfile */}
  },

  jobseeker: {
    [userId]: {/* extends baseProfile */}
  },

  company: {
    [userId]: {/* extends baseProfile */}
  },

  // Shared collections remain the same...
};

/**
 * Security Rules Overview:
 * - Users can only read/write their own profile type data
 * - Shared collections have specific access rules based on profile type
 * - Opportunities are filtered based on user's profile type
 * - Applications are only accessible by their owners
 * - Subscriptions are only accessible by their owners
 * - Notifications are only accessible by their intended recipients
 */

export default firestoreSchema; 