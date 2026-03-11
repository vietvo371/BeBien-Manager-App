import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { HoaDonOpen } from '../../types/order.types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { useAuth } from '../../contexts/AuthContext';

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: string | number): string =>
  Number(value).toLocaleString('vi-VN') + 'đ';

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatElapsed = (dateStr: string): string => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return '< 1 phút';
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h}h`;
};

// ─── Invoice card ─────────────────────────────────────────────────────────────

interface InvoiceCardProps {
  item: HoaDonOpen;
  index: number;
  onPress: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ item, index, onPress }) => {
  const soMonCon = Number(item.so_mon_con);
  const tongMon = Number(item.tong_mon);
  const hasPending = soMonCon > 0;
  const accentColor = hasPending ? theme.colors.error : theme.colors.success;
  const doneMon = tongMon - soMonCon;
  const progressPct = tongMon > 0 ? (doneMon / tongMon) * 100 : 100;

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: accentColor }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.tableBadge, { backgroundColor: accentColor + '15' }]}>
              <Icon name="table-chair" size={14} color={accentColor} />
              <Text style={[styles.tableName, { color: accentColor }]}>
                {item.ten_ban}
              </Text>
            </View>
            <Text style={styles.cardTime}>vào {formatTime(item.thoi_gian_vao)}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.elapsed}>
              {formatElapsed(item.thoi_gian_vao)}
            </Text>
            <Icon name="chevron-right" size={18} color={theme.colors.textTertiary} />
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct}%` as any, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {hasPending
              ? `Còn ${soMonCon}/${tongMon} món chưa xong`
              : `${tongMon} món · Đã hoàn thành`}
          </Text>
        </View>

        {/* Footer row */}
        <View style={styles.cardFooter}>
          <View style={styles.monCount}>
            <Icon name="silverware-fork-knife" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.monCountText}>{tongMon} món</Text>
          </View>
          <Text style={styles.tongTien}>{formatCurrency(item.tong_tien)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

type TabKey = 'pending' | 'done';
type OrderScreenNav = NativeStackNavigationProp<RootStackParamList>;

const OrderScreen: React.FC = () => {
  const navigation = useNavigation<OrderScreenNav>();
  useOrderRealtime();
  const { user } = useAuth();
  const showStats = (user?.is_nguoi_kiem_duyet ?? 1) === 2;

  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['hoaDonOpen'],
    queryFn: () => orderService.getHoaDonOpen(),
    staleTime: 30_000,
  });

  useRefreshOnFocus(refetch);

  const { pending, done } = useMemo(() => {
    const list = data?.data ?? [];
    return {
      pending: list.filter((h) => Number(h.so_mon_con) > 0),
      done: list.filter((h) => Number(h.so_mon_con) === 0),
    };
  }, [data]);

  const activeList = activeTab === 'pending' ? pending : done;

  const handlePress = useCallback(
    (item: HoaDonOpen) => {
      navigation.navigate('OrderDetail', {
        idHoaDon: item.id,
        idBan: item.id_ban,
        tenBan: item.ten_ban,
        thoiGianVao: item.thoi_gian_vao,
        tongTien: String(item.tong_tien),
        tongMon: Number(item.tong_mon),
        soMonCon: Number(item.so_mon_con),
        tienGiamGia: String(item.tien_giam_gia),
        phanTramGiamGia: String(item.phan_tram_giam_gia),
      });
    },
    [navigation]
  );

  const renderCard = useCallback(
    ({ item, index }: { item: HoaDonOpen; index: number }) => (
      <InvoiceCard item={item} index={index} onPress={() => handlePress(item)} />
    ),
    [handlePress]
  );

  // ── Header block (reused in loading/error states) ─────────────────────────

  const HeaderBlock = (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Hóa đơn</Text>
        {data && (
          <Text style={styles.headerSub}>
            {data.so_luong_ban} bàn · {formatCurrency(data.doanh_thu)}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={() => refetch()}
        disabled={isRefetching}
      >
        {isRefetching
          ? <ActivityIndicator size="small" color={theme.colors.white} />
          : <Icon name="refresh" size={22} color={theme.colors.white} />}
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {HeaderBlock}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách bàn...</Text> 
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        {HeaderBlock}
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.errorSub}>Kiểm tra kết nối và thử lại</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Icon name="refresh" size={18} color={theme.colors.white} />
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Danh sách bàn</Text>
          <Text style={styles.headerSub}>
            {data?.so_luong_ban ?? 0} bàn
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching
            ? <ActivityIndicator size="small" color={theme.colors.white} />
            : <Icon name="refresh" size={22} color={theme.colors.white} />}
        </TouchableOpacity>
      </View>

      {/* ── Stats row — chỉ role 2 ── */}
      {showStats && <Animated.View entering={FadeInDown.delay(60).duration(260)} style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {pending.length}
          </Text>
          <Text style={styles.statLabel}>Còn món</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {done.length}
          </Text>
          <Text style={styles.statLabel}>Đã xong</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {formatCurrency(data?.doanh_thu ?? 0)}
          </Text>
          <Text style={styles.statLabel}>Doanh thu</Text>
        </View>
      </Animated.View>}

      {/* ── Tab bar ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(260)} style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabPendingActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.8}
        >
          <Icon
            name="fire"
            size={16}
            color={activeTab === 'pending' ? theme.colors.white : theme.colors.error}
          />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Còn món
          </Text>
          <View style={[
            styles.tabCount,
            activeTab === 'pending' ? styles.tabCountActiveRed : styles.tabCountInactiveRed,
          ]}>
            <Text style={[
              styles.tabCountText,
              { color: activeTab === 'pending' ? theme.colors.white : theme.colors.error },
            ]}>
              {pending.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'done' && styles.tabDoneActive]}
          onPress={() => setActiveTab('done')}
          activeOpacity={0.8}
        >
          <Icon
            name="check-circle-outline"
            size={16}
            color={activeTab === 'done' ? theme.colors.white : theme.colors.success}
          />
          <Text style={[styles.tabText, activeTab === 'done' && styles.tabTextActive]}>
            Đã xong
          </Text>
          <View style={[
            styles.tabCount,
            activeTab === 'done' ? styles.tabCountActiveGreen : styles.tabCountInactiveGreen,
          ]}>
            <Text style={[
              styles.tabCountText,
              { color: activeTab === 'done' ? theme.colors.white : theme.colors.success },
            ]}>
              {done.length}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── List ── */}
      <FlatList
        key={activeTab}
        data={activeList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={[
          styles.listContent,
          activeList.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Icon
              name={activeTab === 'pending' ? 'check-all' : 'clipboard-check-outline'}
              size={72}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'Không còn món chờ' : 'Chưa có bàn hoàn thành'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'pending'
                ? 'Tất cả bàn đã được phục vụ xong'
                : 'Các bàn đang trong quá trình chế biến'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: theme.colors.white,
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.white,
    opacity: 0.8,
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

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    gap: 4,
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
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  tabPendingActive: {
    backgroundColor: theme.colors.error,
  },
  tabDoneActive: {
    backgroundColor: theme.colors.success,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  tabCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabCountActiveRed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountActiveGreen: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountInactiveRed: {
    backgroundColor: theme.colors.error + '20',
  },
  tabCountInactiveGreen: {
    backgroundColor: theme.colors.success + '20',
  },
  tabCountText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Invoice card
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    padding: SPACING.md,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tableName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  cardTime: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  elapsed: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textTertiary,
  },
  progressSection: {
    gap: 4,
  },
  progressBar: {
    height: 5,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monCountText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  tongTien: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: theme.colors.text,
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
  errorSub: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
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
    marginTop: SPACING.sm,
  },
  retryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default OrderScreen;
