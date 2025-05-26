import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MessageRole } from '../lib/supabase';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp: string;
  reference?: string;
}

export default function ChatMessage({
  content,
  role,
  timestamp,
  reference,
}: ChatMessageProps) {
  // Format timestamp for display
  const messageDate = new Date(timestamp);
  let formattedDate;
  
  if (isToday(messageDate)) {
    formattedDate = `Today, ${format(messageDate, 'h:mm a')}`;
  } else if (isYesterday(messageDate)) {
    formattedDate = `Yesterday, ${format(messageDate, 'h:mm a')}`;
  } else {
    formattedDate = format(messageDate, 'MMM d, yyyy h:mm a');
  }

  // Determine the appropriate style based on message role
  const isSystemMessage = role === 'system';
  const isUserMessage = role === 'user';
  
  return (
    <View style={[
      styles.container,
      isSystemMessage && styles.systemContainer,
      isUserMessage && styles.userContainer,
      !isSystemMessage && !isUserMessage && styles.assistantContainer,
    ]}>
      {isSystemMessage && reference && (
        <Text style={styles.reference}>{reference}</Text>
      )}
      
      <View style={[
        styles.bubble,
        isSystemMessage && styles.systemBubble,
        isUserMessage && styles.userBubble,
        !isSystemMessage && !isUserMessage && styles.assistantBubble,
      ]}>
        <Text style={[
          styles.content,
          isSystemMessage && styles.systemContent,
        ]}>
          {content}
        </Text>
      </View>
      
      <Text style={styles.timestamp}>{formattedDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  systemContainer: {
    alignSelf: 'center',
    width: '90%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  systemBubble: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
  },
  assistantBubble: {
    backgroundColor: '#E5E7EB',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  systemContent: {
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  reference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
    textAlign: 'center',
  },
});