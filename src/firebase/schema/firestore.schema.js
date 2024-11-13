/**
 * Firestore Database Schema Documentation
 * 
 * This file defines the complete structure of the Firestore database collections and documents.
 */

// Define the schema structure
const firestoreSchema = {
  // Users collection containing all user types
  users: {
    [userId]: {
      // Personal Information
      personal: {
        fullName: 'string',
        email: 'string',
        phoneNumber: 'string',
        professionalSummary: 'string',
        location: 'string',
        lastUpdated: 'timestamp'
      },

      // Educational Information
      education: {
        degreeLevel: 'string',  // high_school | associates | bachelors | masters | doctorate
        fieldOfStudy: 'string',
        institutionName: 'string',
        graduationDate: 'timestamp',
        gpa: 'number?',
        academicAchievements: 'string?',
        lastUpdated: 'timestamp'
      },

      // Work Experience Information
      workExperience: [{
        companyName: 'string',
        jobTitle: 'string',
        startDate: 'timestamp',
        endDate: 'timestamp?',
        isCurrentPosition: 'boolean',
        responsibilities: 'string',
        achievements: ['string']
      }],

      // Metadata
      metadata: {
        createdAt: 'timestamp',
        lastLoginAt: 'timestamp',
        lastUpdatedAt: 'timestamp',
        isEmailVerified: 'boolean',
        provider: 'string',  // email | google | etc.
        userType: 'string',  // entrepreneur | student | jobseeker | company
        status: 'string'     // active | inactive | pending
      },

      // User Settings
      settings: {
        notifications: 'boolean',
        emailPreferences: {
          marketing: 'boolean',
          updates: 'boolean',
          opportunities: 'boolean'
        },
        theme: 'string'  // light | dark
      }
    }
  },

  // Applications collection for all types of applications
  applications: {
    [applicationId]: {
      // Basic Info
      name: 'string',          // Job application name/title
      category: 'string',      // Job category
      description: 'string',   // Job description
      
      // Dates
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      submissionDate: 'timestamp',
      deadline: 'timestamp',
      
      // Status and Progress
      status: 'string',        // 'pending' | 'approved' | 'rejected' | 'follow-up' | 'incomplete'
      progress: 'number',      // Progress percentage (0-100)
      
      // Relations
      userId: 'string',        // Reference to users collection
      companyId: 'string',     // Reference to company in users collection
      
      // Additional Data
      documents: [{
        type: 'string',        // 'resume' | 'coverLetter' | 'portfolio' | 'other'
        url: 'string',
        name: 'string',
        uploadedAt: 'timestamp'
      }],
      
      // Interview Process
      interviews: [{
        stage: 'string',       // 'phone' | 'technical' | 'hr' | 'final'
        scheduledFor: 'timestamp',
        status: 'string',      // 'scheduled' | 'completed' | 'cancelled'
        notes: 'string'
      }],
      
      // Notes and Feedback
      notes: 'string',
      feedback: 'string',
      
      // Metadata
      lastActivity: 'timestamp',
      isArchived: 'boolean'
    }
  },

  // Opportunities collection for all types of listings
  opportunities: {
    [opportunityId]: {
      type: 'string', // 'job' | 'program' | 'mentorship' | 'partnership' | 'event'
      creatorId: 'string',        // Reference to users collection
      title: 'string',
      description: 'string',
      requirements: ['string'],
      location: {
        type: 'string',           // 'remote' | 'onsite' | 'hybrid'
        address: 'string?',
        country: 'string',
        city: 'string'
      },
      category: 'string',
      status: 'string',           // 'active' | 'closed' | 'draft'
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      expiresAt: 'timestamp',
      visibility: 'string',       // 'public' | 'private' | 'invited'
      compensation: {
        type: 'string',           // 'paid' | 'unpaid' | 'variable'
        amount: 'number?',
        currency: 'string?',
        details: 'string?'
      }
    }
  }
};

// Add indexes configuration
const firestoreIndexes = {
  users: [
    {
      collectionGroup: "users",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "metadata.userType", order: "ASCENDING" },
        { fieldPath: "metadata.lastUpdatedAt", order: "DESCENDING" }
      ]
    },
    {
      collectionGroup: "users",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "metadata.status", order: "ASCENDING" },
        { fieldPath: "metadata.lastUpdatedAt", order: "DESCENDING" }
      ]
    }
  ],
  opportunities: [
    {
      collectionGroup: "opportunities",
      queryScope: "COLLECTION",
      fields: [
        {
          fieldPath: "creatorId",
          order: "ASCENDING"
        },
        {
          fieldPath: "lastActivity",
          order: "DESCENDING"
        }
      ]
    },
    // Add index for status filtering
    {
      collectionGroup: "opportunities",
      queryScope: "COLLECTION",
      fields: [
        {
          fieldPath: "creatorId",
          order: "ASCENDING"
        },
        {
          fieldPath: "status",
          order: "ASCENDING"
        },
        {
          fieldPath: "lastActivity",
          order: "DESCENDING"
        }
      ]
    }
  ]
};

// Export the schema and indexes
export { firestoreSchema, firestoreIndexes }; 