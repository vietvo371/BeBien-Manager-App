import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { OrderStatus } from '../../types/order.types';
import Animated, { FadeInDown } from 'react-native-reanimated';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation<OrderDetailNavigationProp>();
  const queryClient = useQueryClient();
  const { orderId } = route.params;

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    staleTime: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật trạng thái');
    },
  });

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return theme.colors.warning;
      case OrderStatus.CONFIRMED:
        return theme.colors.info;
      case OrderStatus.PREPARING:
        return theme.colors.primary;
      case OrderStatus.READY:
        return theme.colors.success;
      case OrderStatus.COMPLETED:
        return theme.colors.textSecondary;
      case OrderStatus.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xác nhận';
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.PREPARING:
        return 'Đang chuẩn bị';
      case OrderStatus.READY:
        return 'Sẵn sàng';
      case OrderStatus.COMPLETED:
        return 'Hoàn thành';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStatus = useCallback((status: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn cập nhật trạng thái đơn hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => updateStatusMutation.mutate(status),
        },
      ]
    );
  }, [updateStatusMutation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Không thể tải đơn hàng</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Icon name="refresh" size={20} color={theme.colors.white} />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>#{order.order_code}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="share-variant" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={styles.statusCard}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusLabel(order.status)}
              </Text>
            </View>
            <Text style={styles.orderCode}>Đơn hàng #{order.order_code}</Text>
            {order.table_number && (
              <View style={styles.tableRow}>
                <Icon name="table-chair" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.tableText}>Bàn số {order.table_number}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
            <View style={styles.infoCard}>
              {order.customer_name && (
                <View style={styles.infoRow}>
                  <Icon name="account" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.infoLabel}>Tên khách:</Text>
                  <Text style={styles.infoValue}>{order.customer_name}</Text>
                </View>
              )}
              {order.customer_phone && (
                <View style={styles.infoRow}>
                  <Icon name="phone" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoValue}>{order.customer_phone}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Icon name="clock-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Thời gian:</Text>
                <Text style={styles.infoValue}>{formatDateTime(order.created_at)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết món ăn</Text>
            <View style={styles.itemsCard}>
              {order.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.itemRow, index < order.items.length - 1 && styles.itemRowBorder]}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      {item.notes && (
                        <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng kết</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
              </View>
              {order.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Giảm giá:</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                    -{formatCurrency(order.discount)}
                  </Text>
                </View>
              )}
              {order.tax > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Thuế VAT:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {order.notes && (
          <Animated.View entering={FadeInDown.delay(400).duration(300)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
        <View style={styles.footer}>
          {order.status === OrderStatus.PENDING && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateStatus(OrderStatus.CONFIRMED)}
              activeOpacity={0.8}
            >
              <Icon name="check-circle" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          )}
          {order.status === OrderStatus.CONFIRMED && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateStatus(OrderStatus.PREPARING)}
              activeOpacity={0.8}
            >
              <Icon name="chef-hat" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Bắt đầu nấu</Text>
            </TouchableOpacity>
          )}
          {order.status === OrderStatus.PREPARING && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => handleUpdateStatus(OrderStatus.READY)}
              activeOpacity={0.8}
            >
              <Icon name="bell-ring" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Sẵn sàng</Text>
            </TouchableOpacity>
          )}
          {order.status === OrderStatus.READY && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => handleUpdateStatus(OrderStatus.COMPLETED)}
              activeOpacity={0.8}
            >
              <Icon name="checkbox-marked-circle" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: SPACING.xs,
    width: 40,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: theme.colors.card,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  orderCode: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tableText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemsCard: {
    backgroundColor: theme.colors.card,
    padding: SPACING.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.sm,
  },
  itemQuantity: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.primary,
    minWidth: 30,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
  },
  itemNotes: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: SPACING.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  notesCard: {
    backgroundColor: theme.colors.card,
    padding: SPACING.lg,
  },
  notesText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    backgroundColor: theme.colors.card,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: BUTTON_HEIGHT.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
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
});

export default OrderDetailScreen;
