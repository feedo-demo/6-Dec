import OpenAI from 'openai';
import { tokenUsageService } from './tokenUsage';

let openai = null;

try {
  const API_KEY = 'api-key-will-go-here';
  
  if (API_KEY) {
    console.log('Initializing OpenAI with API key:', API_KEY.substring(0, 10) + '...');
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OpenAI API key is not configured');
  }
} catch (error) {
  console.error('OpenAI service initialization error:', error);
}

export const generateProfessionalSummary = async (currentSummary, maxLength = 500, userId) => {
  if (!openai) {
    console.error('OpenAI client is not initialized');
    throw new Error('OpenAI service is not initialized. Please configure your API key.');
  }

  if (!userId) {
    throw new Error('User ID is required for token tracking');
  }

  try {
    // Check token availability before making the request
    const availability = await tokenUsageService.checkTokenAvailability(userId);
    if (!availability.isAvailable) {
      throw new Error('You have reached your monthly token limit. Please upgrade your plan to continue using AI features.');
    }

    console.log('Starting text enhancement with OpenAI...');
    console.log('Current text:', currentSummary);
    console.log('Max length:', maxLength);
    
    const prompt = `Enhance this professional summary while maintaining its exact structure and personal details. DO NOT add any introductions or greetings that aren't in the original text. If the original starts with "Hello" or "I'm [Name]", keep that exact introduction. Preserve all personal details including name, location, and specific experiences. Make the text more professional and engaging while keeping the original flow and style. IMPORTANT: The enhanced text MUST NOT exceed ${maxLength} characters:\n\n${currentSummary || 'Please generate a professional summary'}`;

    console.log('Sending request to OpenAI with prompt:', prompt);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional resume writer who enhances text while strictly maintaining its original structure and length constraints. Important rules: 1) NEVER add introductions or greetings that aren't in the original text, 2) If there's no 'Hello' or 'I'm [Name]' in the original, don't add it, 3) Keep the same starting point as the original text, 4) Preserve all personal details and experiences exactly as mentioned, 5) Only enhance the professional tone and clarity while keeping the original structure intact, 6) Ensure the response is no longer than ${maxLength} characters.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: Math.min(500, Math.ceil(maxLength / 2)), // Adjust max_tokens based on character limit
      temperature: 0.7,
    });

    let enhancedText = completion.choices[0].message.content.trim();
    
    // Ensure the text doesn't exceed maxLength
    if (enhancedText.length > maxLength) {
      console.log('Truncating response to meet character limit');
      enhancedText = enhancedText.substring(0, maxLength);
      // Try to find the last complete sentence
      const lastPeriod = enhancedText.lastIndexOf('.');
      if (lastPeriod > maxLength * 0.8) { // Only truncate at sentence if we're not losing too much
        enhancedText = enhancedText.substring(0, lastPeriod + 1);
      }
    }

    // Calculate and update token usage
    const totalTokens = completion.usage.total_tokens;
    await tokenUsageService.updateTokenUsage(userId, totalTokens);

    console.log('Final enhanced text length:', enhancedText.length);
    console.log('Tokens used:', totalTokens);
    return enhancedText;
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
}; 
