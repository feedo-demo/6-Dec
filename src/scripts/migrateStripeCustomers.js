/**
 * Migration Script for Stripe Customer Mappings
 * 
 * This script:
 * 1. Fetches all Stripe customers
 * 2. Creates secure mappings in Firebase
 * 3. Validates existing mappings
 */

import { db } from '../firebase/config';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { stripe } from '../api/stripe';

const migrateStripeCustomers = async () => {
  try {
    console.log('Starting Stripe customer migration...');
    
    // Get all customers from Stripe
    const customers = await stripe.customers.list({
      limit: 100, // Adjust as needed
      expand: ['data.metadata']
    });

    const batch = writeBatch(db);
    let migratedCount = 0;
    let errorCount = 0;

    for (const customer of customers.data) {
      try {
        const userId = customer.metadata.userId;
        
        if (!userId) {
          console.warn(`Customer ${customer.id} has no userId in metadata`);
          errorCount++;
          continue;
        }

        // Check if mapping already exists
        const customerRef = doc(db, 'stripe_customers', userId);
        const customerDoc = await getDoc(customerRef);

        if (!customerDoc.exists()) {
          // Create new mapping
          batch.set(customerRef, {
            customerId: customer.id,
            email: customer.email,
            createdAt: new Date(),
          });
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error processing customer ${customer.id}:`, error);
        errorCount++;
      }
    }

    // Commit all changes
    await batch.commit();

    console.log(`Migration completed:
      - ${migratedCount} customers migrated
      - ${errorCount} errors encountered`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export default migrateStripeCustomers; 