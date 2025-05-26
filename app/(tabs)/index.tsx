import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import StreakIndicator from '@/components/StreakIndicator';
import { getVerseOfTheDay } from '@/lib/bible-service';
import { 
  getMessageHistory, 
  addMessage, 
  updateUserStreak,
  getAIResponse
} from '@/lib/chat-service';
import { Message } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export default function ChatScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todaysVerse, setTodaysVerse] = useState<{
    reference: string;
    text: string;
    translation: string;
    date: string;
  } | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Initial data loading
  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;

      // Create new abort controller for this focus session
      abortController.current = new AbortController();
      const signal = abortController.current.signal;
      
      const loadData = async () => {
        try {
          console.log('Starting data load for user:', userId);
          
          // Check Supabase connection
          const { data: connectionTest, error: connectionError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
            .abortSignal(signal);
            
          if (connectionError) {
            throw new Error(`Supabase connection failed: ${connectionError.message}`);
          }
          
          if (!isMounted.current) return;
          console.log('Supabase connection successful');
          
          // Load message history
          const history = await getMessageHistory(userId);
          if (!isMounted.current) return;
          console.log('Message history loaded:', history.length, 'messages');
          setMessages(history);
          
          // Load today's verse (or get a new one)
          const today = format(new Date(), 'yyyy-MM-dd');
          console.log('Checking for verse on:', today);
          
          const todaySystemMessage = history.find(
            msg => msg.role === 'system' && msg.conversation_date === today
          );
          
          if (todaySystemMessage) {
            if (!isMounted.current) return;
            console.log('Found existing verse for today');
            // Extract verse info from the message
            try {
              const parts = todaySystemMessage.content.split(' - ');
              if (parts.length > 1) {
                setTodaysVerse({
                  reference: parts[0],
                  text: parts.slice(1).join(' - '),
                  translation: 'WEB',
                  date: today,
                });
              }
            } catch (error) {
              console.error('Error parsing verse:', error);
            }
          } else {
            // Fetch a new verse for today
            console.log('Fetching new verse for today');
            const verse = await getVerseOfTheDay();
            if (!isMounted.current) return;
            console.log('Verse fetched:', verse?.reference);
            setTodaysVerse(verse);
            
            // Add the verse as a system message
            if (isMounted.current) {
              const verseMessage = await addMessage(
                userId,
                `${verse.reference} - ${verse.text}`,
                'system'
              );
              
              if (verseMessage && isMounted.current) {
                setMessages(prev => [...prev, verseMessage]);
              }
            }
          }
          
          // Update user streak
          const streakUpdated = await updateUserStreak(userId);
          if (streakUpdated && isMounted.current) {
            // Get updated streak count
            const { data } = await supabase
              .from('profiles')
              .select('current_streak')
              .eq('id', userId)
              .single()
              .abortSignal(signal);
            
            if (data && isMounted.current) {
              setCurrentStreak(data.current_streak);
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Data loading aborted');
            return;
          }
          console.error('Error in loadData:', error);
          if (!isMounted.current) return;
          setMessages([{
            id: 'error',
            user_id: userId,
            content: 'Unable to load messages. Please check your connection and try again.',
            role: 'system',
            created_at: new Date().toISOString(),
            conversation_date: format(new Date(), 'yyyy-MM-dd')
          }]);
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      };
      
      loadData();
      
      return () => {
        if (abortController.current) {
          abortController.current.abort();
        }
      };
    }, [userId])
  );
  
  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!userId || !todaysVerse) return;
    
    try {
      // Add user message
      const userMessage = await addMessage(userId, content, 'user');
      if (userMessage && isMounted.current) {
        setMessages(prev => [...prev, userMessage]);
        // Scroll to bottom
        flatListRef.current?.scrollToEnd({ animated: true });
      }
      
      // Get AI response
      if (isMounted.current) setIsResponding(true);
      const aiResponse = await getAIResponse(
        userId,
        content,
        todaysVerse.text,
        todaysVerse.reference
      );
      
      // Add AI response to messages
      if (isMounted.current) {
        const assistantMessage = await addMessage(userId, aiResponse, 'assistant');
        if (assistantMessage && isMounted.current) {
          setMessages(prev => [...prev, assistantMessage]);
          // Scroll to bottom
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      if (isMounted.current) {
        setIsResponding(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible Chat</Text>
        <StreakIndicator count={currentStreak} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your daily verse...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            renderItem={({ item }) => (
              <ChatMessage
                content={item.content}
                role={item.role}
                timestamp={item.created_at}
                reference={
                  item.role === 'system' ? item.content.split(' - ')[0] : undefined
                }
              />
            )}
            onContentSizeChange={() => 
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
          
          <MessageInput 
            onSend={handleSendMessage}
            isLoading={isResponding}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#8B5CF6',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
});