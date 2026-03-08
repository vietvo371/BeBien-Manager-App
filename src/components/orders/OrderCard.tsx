import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { Order, OrderStatus } from '../../types/order.types';
import { Swipeable } from 'react-native-gesture-handler';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onCancel?: () => void;
  showCancelAction?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onCancel,
  showCancelAction = true,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

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

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'clock-outline';
      case OrderStatus.CONFIRMED:
        return 'check-circle-outline';
      case OrderStatus.PREPARING:
        return 'chef-hat';
      case OrderStatus.READY:
        return 'bell-ring-outline';
      case OrderStatus.COMPLETED:
        return 'checkbox-marked-circle';
      case OrderStatus.CANCELLED:
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!showCancelAction || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
      return null;
    }

    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onCancel?.();
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
          <Icon name="close-circle" size={24} color={theme.colors.white} />
          <Text style={styles.deleteText}>Hủy</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderCode}>#{order.order_code}</Text>
            {order.table_number && (
              <View style={styles.tableTag}>
                <Icon name="table-chair" size={14} color={theme.colors.primary} />
                <Text style={styles.tableText}>Bàn {order.table_number}</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Icon
              name={getStatusIcon(order.status)}
              size={16}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Icon name="package-variant" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              {order.items.length} món • {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
            </Text>
          </View>

          {order.customer_name && (
            <View style={styles.infoRow}>
              <Icon name="account" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{order.customer_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(order.created_at)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
        </View>

        {order.cancellation_status === 'pending' && (
          <View style={styles.pendingBanner}>
            <Icon name="alert-circle" size={16} color={theme.colors.warning} />
            <Text style={styles.pendingText}>Đang chờ duyệt hủy</Text>
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderCode: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: SPACING.sm,
  },
  tableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  tableText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  content: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: theme.colors.warningLight,
    borderRadius: BORDER_RADIUS.sm,
  },
  pendingText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: SPACING.sm,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  deleteContent: {
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
