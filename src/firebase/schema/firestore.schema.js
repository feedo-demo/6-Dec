/**
 * Firestore Database Schema Documentation
 */

const firestoreSchema = {
  users: {
    [userId]: {
      profile: {
        authUid: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        fullName: 'string',
        phoneNumber: 'string',
        professionalSummary: 'string',
        location: 'string',
        photoURL: 'string',
        provider: 'string',
        userType: 'string',
        isEmailVerified: 'boolean',
        createdAt: 'timestamp',
        lastLoginAt: 'timestamp',
        lastUpdated: 'timestamp'
      },
      metadata: {
        createdAt: 'timestamp',
        lastUpdatedAt: 'timestamp',
        userType: 'string',
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phoneNumber: 'string',
        location: 'string'
      },
      profileData: {
        [sectionId]: {
          [questionId]: {
            value: 'any',
            groups: [{
              [fieldId]: 'any'
            }],
            selectedOptions: ['string'],
            fileUrl: 'string'
          }
        }
      },
      settings: {
        notifications: 'boolean',
        theme: 'string',
        emailPreferences: {
          marketing: 'boolean',
          updates: 'boolean',
          opportunities: 'boolean'
        }
      }
    }
  },
  admin: {
    profiles: {
      profileTypes: {
        [profileTypeId]: {
          id: 'string',
          label: 'string',
          sections: {
            [sectionId]: {
              id: 'string',
              label: 'string',
              questions: [
                {
                  id: 'string',
                  question: 'string',
                  description: 'string',
                  type: 'string',
                  required: 'boolean',
                  order: 'number',
                  options: ['string'],
                  validation: {
                    minLength: 'number?',
                    maxLength: 'number?',
                    pattern: 'string?',
                    minGroups: 'number?',
                    maxGroups: 'number?'
                  },
                  repeaterFields: [
                    {
                      id: 'string',
                      label: 'string',
                      type: 'string',
                      required: 'boolean',
                      width: 'string',
                      options: ['string[]?'],
                      validation: {
                        fileTypes: ['string'],
                        minLength: 'number',
                        maxLength: 'number'
                      }
                    }
                  ],
                  allowMultipleGroups: 'boolean?'
                }
              ],
              updatedAt: 'timestamp'
            }
          },
          metadata: {
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
            version: 'number'
          }
        }
      }
    }
  }
};

export { firestoreSchema }; 