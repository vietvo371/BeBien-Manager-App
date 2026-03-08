import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { OrderCard } from '../../components/orders/OrderCard';
import { FilterModal } from '../../components/orders/FilterModal';
import { useOrderStore } from '../../stores/orderStore';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, OrderFilters } from '../../types/order.types';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertPrompt } from '../../utils/alertPrompt';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type TabValue = 'all' | OrderStatus;

interface Tab {
  value: TabValue;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { value: 'all', label: 'Tất cả', icon: 'view-grid' },
  { value: OrderStatus.PENDING, label: 'Chờ', icon: 'clock-outline' },
  { value: OrderStatus.PREPARING, label: 'Nấu', icon: 'chef-hat' },
  { value: OrderStatus.COMPLETED, label: 'Xong', icon: 'check-circle' },
  { value: OrderStatus.CANCELLED, label: 'Hủy', icon: 'close-circle' },
];

type OrderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OrderScreen: React.FC = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { filters, setFilters, resetFilters } = useOrderStore();

  useOrderRealtime();

  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const currentFilters = useMemo(
    () => ({
      ...filters,
      status: activeTab === 'all' ? undefined : activeTab,
      searchQuery: searchQuery.trim(),
    }),
    [filters, activeTab, searchQuery]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['orders', currentFilters],
    queryFn: ({ pageParam = 1 }) =>
      orderService.getOrders(pageParam, 20, currentFilters),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30000,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (params: { orderId: number; reason: string }) =>
      orderService.cancelOrder({ order_id: params.orderId, reason: params.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Thành công', 'Yêu cầu hủy đơn hàng đã được gửi');
    },
    onError: (error: any) => {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể hủy đơn hàng'
      );
    },
  });

  const orders = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.orders) || [];
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOrderPress = useCallback((order: Order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  }, [navigation]);

  const handleCancelOrder = useCallback((order: Order) => {
    Alert.alert(
      'Hủy đơn hàng',
      `Bạn có chắc muốn hủy đơn hàng #${order.order_code}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: () => {
            alertPrompt(
              'Lý do hủy',
              'Vui lòng nhập lý do hủy đơn hàng',
              [
                { text: 'Bỏ qua', style: 'cancel' },
                {
                  text: 'Xác nhận',
                  onPress: (reason) => {
                    if (reason?.trim()) {
                      cancelOrderMutation.mutate({
                        orderId: order.id,
                        reason: reason.trim(),
                      });
                    } else {
                      Alert.alert('Lỗi', 'Vui lòng nhập lý do hủy');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  }, [cancelOrderMutation]);

  const handleTabPress = useCallback((tab: TabValue) => {
    setActiveTab(tab);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleFilterPress = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  const handleApplyFilters = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setSearchQuery('');
    setActiveTab('all');
  }, [resetFilters]);

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => handleTabPress(tab.value)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={18}
              color={isActive ? theme.colors.primary : theme.colors.white}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View
        style={[
          styles.searchBar,
          isSearchFocused && styles.searchBarFocused,
        ]}
      >
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm đơn hàng, số bàn..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={handleFilterPress}
        activeOpacity={0.7}
      >
        <Icon name="filter-variant" size={20} color={theme.colors.primary} />
        {(filters.tableNumber || filters.minTotal || filters.maxTotal) && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="clipboard-list-outline" size={80} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Không tìm thấy đơn hàng phù hợp'
          : 'Chưa có đơn hàng nào trong danh sách'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderOrderCard = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <OrderCard
          order={item}
          onPress={() => handleOrderPress(item)}
          onCancel={() => handleCancelOrder(item)}
          showCancelAction={
            item.status !== OrderStatus.COMPLETED &&
            item.status !== OrderStatus.CANCELLED
          }
        />
      </Animated.View>
    ),
    [handleOrderPress, handleCancelOrder]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng</Text>
        </View>
        <View style={styles.tabBarSection}>
          {renderTabBar()}
          {renderSearchBar()}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng</Text>
        </View>
        <View style={styles.tabBarSection}>
          {renderTabBar()}
          {renderSearchBar()}
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Không thể tải đơn hàng</Text>
          <Text style={styles.errorSubtitle}>Vui lòng kiểm tra kết nối và thử lại</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Icon name="refresh" size={20} color={theme.colors.white} />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="bell-outline" size={24} color={theme.colors.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabBarSection}>
          {renderTabBar()}
          {renderSearchBar()}
        </View>

        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            orders.length === 0 && styles.listContentEmpty,
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title="Đang tải..."
              titleColor={theme.colors.textSecondary}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        <FilterModal
          visible={isFilterModalVisible}
          currentFilters={filters}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: theme.colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: '800',
    color: theme.colors.primary,
  },
  tabBarSection: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    marginBottom: SPACING.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: theme.colors.overlayLight,
  },
  tabActive: {
    backgroundColor: theme.colors.backgroundTertiary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    backgroundColor: theme.colors.primary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: BUTTON_HEIGHT.md,
    backgroundColor: theme.colors.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchBarFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    padding: 0,
  },
  filterButton: {
    width: BUTTON_HEIGHT.md,
    height: BUTTON_HEIGHT.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
});

export default OrderScreen;
