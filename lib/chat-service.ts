import { supabase, Message, MessageRole } from './supabase';
import { format } from 'date-fns';

const CHACHI_API_URL = 'https://api.chachi.ai/v1/chat/completions';
const CHACHI_API_KEY = process.env.EXPO_PUBLIC_CHACHI_API_KEY;

async function getChachiResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(CHACHI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHACHI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mini-2',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Bible study assistant. Provide insightful, respectful commentary that encourages deeper reflection.',
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting Chachi response:', error);
    return "I apologize, but I couldn't process your message right now. Please try again.";
  }
}

// Function to get message history for a user
export async function getMessageHistory(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching message history:', error);
    return [];
  }
  
  return data as Message[];
}

// Function to add a new message
export async function addMessage(
  userId: string,
  content: string,
  role: MessageRole
): Promise<Message | null> {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        user_id: userId,
        content,
        role,
        conversation_date: today,
      },
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding message:', error);
    return null;
  }
  
  return data as Message;
}

// Function to update user streak
export async function updateUserStreak(userId: string): Promise<boolean> {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Get the user's current streak info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, last_engaged_date')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return false;
    }
    
    // Calculate the new streak value
    let newStreakValue = 1; // Default to 1 if this is the first engagement
    
    if (profileData.last_engaged_date) {
      const lastDate = new Date(profileData.last_engaged_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If the last engagement was yesterday, increment the streak
      if (format(lastDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        newStreakValue = profileData.current_streak + 1;
      }
      // If the last engagement was today, keep the streak the same
      else if (format(lastDate, 'yyyy-MM-dd') === today) {
        newStreakValue = profileData.current_streak;
        return true; // No update needed
      }
      // Otherwise (if there was a gap), reset to 1
    }
    
    // Update the streak and last engaged date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_streak: newStreakValue,
        last_engaged_date: today,
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating streak:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserStreak:', error);
    return false;
  }
}

// Function to get AI response
export async function getAIResponse(
  userId: string,
  userMessage: string,
  verseText: string,
  verseReference: string
): Promise<string> {
  try {
    const prompt = `The user is reflecting on this Bible verse: "${verseText}" (${verseReference}). Here is their message: "${userMessage}"`;
    return await getChachiResponse(prompt);
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm sorry, I couldn't process your message right now. Please try again later.";
  }
}