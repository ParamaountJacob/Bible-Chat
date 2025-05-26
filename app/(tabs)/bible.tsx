import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Search, BookOpen } from 'lucide-react-native';

interface BibleVerse {
  reference: string;
  text: string;
}

export default function BibleScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Search the Bible API for the query
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }
      
      const data = await response.json();
      
      // Format the response as a search result
      if (data.verses && data.verses.length > 0) {
        if (!isMounted.current) return;
        // Multiple verses
        const verses = data.verses.map((verse: any) => ({
          reference: `${data.reference} (${verse.verse})`,
          text: verse.text.trim(),
        }));
        setSearchResults(verses);
      } else {
        if (!isMounted.current) return;
        // Single verse
        setSearchResults([{
          reference: data.reference,
          text: data.text.trim(),
        }]);
      }
    } catch (err) {
      console.error('Error searching Bible:', err);
      if (!isMounted.current) return;
      setError('Could not find that verse. Try using a format like "John 3:16" or "Psalm 23".');
      setSearchResults([]);
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a verse (e.g., John 3:16)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
          >
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.centerContent}>
          <BookOpen size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            Search for Bible verses by reference (e.g., "John 3:16", "Psalm 23")
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.reference}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <Text style={styles.verseReference}>{item.reference}</Text>
              <Text style={styles.verseText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.resultsList}
        />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 50,
    backgroundColor: '#F9FAFB',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  searchButton: {
    position: 'absolute',
    right: 4,
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verseReference: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#8B5CF6',
    marginBottom: 8,
  },
  verseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
});