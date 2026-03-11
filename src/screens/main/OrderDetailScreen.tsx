import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { HoaDonChiTietItem } from '../../types/order.types';
import Animated, { FadeInDown } from 'react-native-reanimated';

type DetailRoute = RouteProp<RootStackParamList, 'OrderDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: string | number): string =>
  Number(value).toLocaleString('vi-VN') + 'đ';

const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatElapsed = (dateStr: string): string => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return '< 1 phút';
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h}h`;
};

// ─── Item status badge ────────────────────────────────────────────────────────

interface ItemStatus {
  label: string;
  color: string;
  bg: string;
  icon: string;
}

const getItemStatus = (item: HoaDonChiTietItem, thoiGianVao: string): ItemStatus => {
  if (item.is_print === 0) {
    return {
      label: 'Không In',
      color: theme.colors.textSecondary,
      bg: theme.colors.borderLight,
      icon: 'printer-off-outline',
    };
  }
  if (item.is_che_bien === 0) {
    const elapsed = formatElapsed(thoiGianVao);
    return {
      label: `Đang CB · ${elapsed}`,
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'chef-hat',
    };
  }
  return {
    label: 'Xong',
    color: theme.colors.success,
    bg: theme.colors.successLight,
    icon: 'check-circle-outline',
  };
};

// ─── Item row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: HoaDonChiTietItem;
  index: number;
  lastIndex: number;
  thoiGianVao: string;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, index, lastIndex, thoiGianVao }) => {
  const status = getItemStatus(item, thoiGianVao);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(260)}>
      <View style={[styles.itemRow, index < lastIndex && styles.itemRowBorder]}>
        {/* Left: qty */}
        <View style={styles.itemQtyBox}>
          <Text style={styles.itemQty}>{parseFloat(item.so_luong).toFixed(0)}</Text>
        </View>

        {/* Middle: name + note */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.ten_mat_hang}</Text>
          {item.ghi_chu ? (
            <Text style={styles.itemNote}>
              <Icon name="note-text-outline" size={12} color={theme.colors.textTertiary} />{' '}
              {item.ghi_chu}
            </Text>
          ) : null}
          <Text style={styles.itemPrice}>{formatCurrency(item.thanh_tien)}</Text>
        </View>

        {/* Right: status badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Icon name={status.icon} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const {
    idHoaDon,
    tenBan,
    thoiGianVao,
    tongTien,
    tongMon,
    soMonCon,
    tienGiamGia,
    phanTramGiamGia,
  } = route.params;

  const { data: items, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['hoaDonChiTiet', idHoaDon],
    queryFn: () => orderService.getHoaDonChiTiet(idHoaDon),
    staleTime: 30_000,
  });

  const hasPending = soMonCon > 0;
  const accentColor = hasPending ? theme.colors.error : theme.colors.success;

  const renderItem = useCallback(
    ({ item, index }: { item: HoaDonChiTietItem; index: number }) => (
      <ItemRow
        item={item}
        index={index}
        lastIndex={(items?.length ?? 1) - 1}
        thoiGianVao={thoiGianVao}
      />
    ),
    [items, thoiGianVao]
  );

  // ── Loading / error ──────────────────────────────────────────────────────────

  const renderHeader = () => (
    <>
      {/* Invoice summary card */}
      <Animated.View entering={FadeInDown.duration(260)} style={styles.summaryCard}>
        {/* Entry time */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Icon name="clock-in" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.summaryLabel}>Giờ vào</Text>
          </View>
          <Text style={styles.summaryValue}>{formatDateTime(thoiGianVao)}</Text>
        </View>
        <View style={styles.divider} />

        {/* Total items */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Icon name="silverware-fork-knife" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.summaryLabel}>Tổng món</Text>
          </View>
          <Text style={styles.summaryValue}>{tongMon} món</Text>
        </View>

        {/* Pending items */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Icon name="chef-hat" size={16} color={hasPending ? theme.colors.error : theme.colors.success} />
            <Text style={styles.summaryLabel}>Còn chế biến</Text>
          </View>
          <Text style={[styles.summaryValue, { color: hasPending ? theme.colors.error : theme.colors.success }]}>
            {soMonCon} món
          </Text>
        </View>

        {/* Discount */}
        {parseFloat(tienGiamGia) > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Icon name="tag-outline" size={16} color={theme.colors.success} />
                <Text style={styles.summaryLabel}>
                  Giảm giá {parseFloat(phanTramGiamGia) > 0 ? `(${phanTramGiamGia}%)` : ''}
                </Text>
              </View>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                -{formatCurrency(tienGiamGia)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={[styles.totalValue, { color: accentColor }]}>
            {formatCurrency(tongTien)}
          </Text>
        </View>
      </Animated.View>

      {/* Items section header */}
      <Animated.View entering={FadeInDown.delay(100).duration(260)}>
        <Text style={styles.itemsSectionTitle}>
          Danh sách món ({items?.length ?? 0})
        </Text>
      </Animated.View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{tenBan}</Text>
          <Text style={styles.headerSub}>
            {hasPending
              ? `${soMonCon} món đang chế biến`
              : 'Đã hoàn thành'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Icon name="refresh" size={22} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={56} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Không thể tải chi tiết</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Icon name="refresh" size={18} color={theme.colors.white} />
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyItems}>
              <Icon name="silverware-clean" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyItemsText}>Chưa có món nào</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: theme.colors.white,
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Summary card
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
    backgroundColor: theme.colors.borderLight,
    marginVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },

  // Items section
  itemsSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: theme.colors.card,
    gap: SPACING.md,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  itemQtyBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemQty: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 20,
  },
  itemNote: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    flexShrink: 0,
    maxWidth: 120,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    flexShrink: 1,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyItemsText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
});

export default OrderDetailScreen;
