import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';

const FREE_TIER_LIMIT = 5000; // 5000 tokens per month for free tier
const PRO_TIER_LIMIT = 50000; // 50000 tokens per month for pro tier

export const tokenUsageService = {
  async getUserTokenUsage(userId) {
    try {
      const userTokensRef = doc(db, 'tokenUsage', userId);
      const snapshot = await getDoc(userTokensRef);
      
      if (!snapshot.exists()) {
        // Initialize token usage if it doesn't exist
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const initialData = {
          totalTokensUsed: 0,
          monthlyUsage: {
            [currentMonth]: 0
          },
          lastUpdated: new Date().toISOString()
        };
        await setDoc(userTokensRef, initialData);
        return initialData;
      }
      
      return snapshot.data();
    } catch (error) {
      console.error('Error getting token usage:', error);
      throw error;
    }
  },

  async updateTokenUsage(userId, tokensUsed) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const userTokensRef = doc(db, 'tokenUsage', userId);
      
      // Update the token usage
      await updateDoc(userTokensRef, {
        totalTokensUsed: increment(tokensUsed),
        [`monthlyUsage.${currentMonth}`]: increment(tokensUsed),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating token usage:', error);
      throw error;
    }
  },

  async checkTokenAvailability(userId, userTier = 'free') {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await this.getUserTokenUsage(userId);
      const monthlyUsage = usage.monthlyUsage?.[currentMonth] || 0;
      
      const limit = userTier === 'pro' ? PRO_TIER_LIMIT : FREE_TIER_LIMIT;
      const remaining = limit - monthlyUsage;
      
      return {
        isAvailable: remaining > 0,
        remaining,
        limit,
        monthlyUsage,
        percentageUsed: Math.round((monthlyUsage / limit) * 100)
      };
    } catch (error) {
      console.error('Error checking token availability:', error);
      throw error;
    }
  }
}; 