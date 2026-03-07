import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { colors } from '../../theme/colors';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';

/**
 * ScreenName - Brief description of screen purpose
 * 
 * Features:
 * - List items with pull-to-refresh
 * - Search functionality
 * - Navigation to detail screen
 * - Error handling and loading states
 */

// ========== Types ==========
type RootStackParamList = {
  ScreenName: undefined;
  DetailScreen: { id: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Item {
  id: string;
  title: string;
  description: string;
}

// ========== Main Component ==========
export const ScreenName: React.FC = () => {
  // ========== Hooks ==========
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const queryClient = useQueryClient();

  // ========== State ==========
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ========== API Queries ==========
  const {
    data: items,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['items', searchQuery],
    queryFn: () => fetchItems(searchQuery),
    staleTime: 30000, // 30 seconds
    retry: 3,
  });

  // ========== Mutations ==========
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
    },
  });

  // ========== Effects ==========
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup
    };
  }, []);

  // ========== Callbacks ==========
  const handleItemPress = useCallback((item: Item) => {
    navigation.navigate('DetailScreen', { id: item.id });
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // ========== Render Functions ==========
  const renderItem = useCallback(({ item }: { item: Item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={styles.itemCard}
      activeOpacity={0.7}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </TouchableOpacity>
  ), [handleItemPress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('screen.no_items')}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('screen.title')}</Text>
      {/* Add search bar or filters here */}
    </View>
  );

  // ========== Loading State ==========
  if (isLoading && !items) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // ========== Error State ==========
  if (error && !items) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorMessage
          error={error}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  // ========== Main Render ==========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View 
        style={styles.content}
        entering={FadeIn.duration(300)}
      >
        {renderHeader()}
        
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />

        {/* Floating Action Button (if needed) */}
        {/* <TouchableOpacity style={styles.fab}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity> */}
      </Animated.View>
    </SafeAreaView>
  );
};

// ========== Helper Functions ==========
async function fetchItems(searchQuery: string): Promise<Item[]> {
  // TODO: Implement actual API call
  // Example:
  // const response = await apiClient.get('/items', { params: { search: searchQuery } });
  // return response.data;
  
  // Mock data for now
  return [
    { id: '1', title: 'Item 1', description: 'Description 1' },
    { id: '2', title: 'Item 2', description: 'Description 2' },
  ];
}

async function deleteItem(id: string): Promise<void> {
  // TODO: Implement actual API call
  // await apiClient.delete(`/items/${id}`);
}

// ========== Styles ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

// ========== Export ==========
export default ScreenName;
