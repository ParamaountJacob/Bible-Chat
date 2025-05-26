import { format } from 'date-fns';

// Bible API service
export async function getRandomVerse(): Promise<{
  reference: string;
  text: string;
  translation: string;
}> {
  try {
    console.log('Fetching random verse from Bible API');
    // Fetch a random verse from the Bible API
    const response = await fetch('https://bible-api.com/random');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received verse:', data.reference);
    
    return {
      reference: data.reference,
      text: data.text.trim(),
      translation: data.translation_name || 'WEB',
    };
  } catch (error) {
    console.error('Error fetching random verse:', error);
    
    // Provide a fallback verse in case of API failure
    return {
      reference: 'Psalm 119:105',
      text: 'Your word is a lamp to my feet, and a light for my path.',
      translation: 'WEB',
    };
  }
}

// Function to get a verse for today
export async function getVerseOfTheDay(savedVerse?: {
  reference: string;
  text: string;
  translation: string;
  date: string;
}) {
  console.log('Getting verse of the day');
  // Format today's date as YYYY-MM-DD
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // If we already have a verse for today, return it
  if (savedVerse && savedVerse.date === today) {
    console.log('Using saved verse for today:', savedVerse.reference);
    return savedVerse;
  }
  
  // Otherwise fetch a new verse
  console.log('Fetching new verse for today');
  const verse = await getRandomVerse();
  
  // Return the verse with today's date
  return {
    ...verse,
    date: today,
  };
}