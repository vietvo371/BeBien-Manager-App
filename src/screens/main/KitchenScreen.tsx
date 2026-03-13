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
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { orderService } from '../../services/orderService';
import { BepDonMonTheoBan, BepXongMonTheoNhom } from '../../types/order.types';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'theo-ban' | 'theo-nhom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseFloat2 = (v: string): number => parseFloat(v) || 0;

/** Hiển thị số lượng float — bỏ .00 nhưng giữ .5 */
const fmtQty = (v: string): string => {
  const n = parseFloat2(v);
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/0+$/, '');
};

/** Thời gian chờ tính từ updated_at đến hiện tại */
const fmtElapsed = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 1) return '< 1p';
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}p` : `${h}h`;
};

/** Màu badge thời gian: xanh < 15p, cam 15–30p, đỏ > 30p */
const elapsedColor = (dateStr?: string): string => {
  if (!dateStr) return theme.colors.textSecondary;
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 15) return theme.colors.success;
  if (mins < 30) return '#D97706';
  return theme.colors.error;
};

// Group BepDonMonTheoBan by ban name
type BanGroup = { ban: string; items: BepDonMonTheoBan[] };

const groupByBan = (data: BepDonMonTheoBan[]): BanGroup[] => {
  const map = new Map<string, BepDonMonTheoBan[]>();
  for (const item of data) {
    const existing = map.get(item.ban) ?? [];
    existing.push(item);
    map.set(item.ban, existing);
  }
  return Array.from(map.entries()).map(([ban, items]) => ({ ban, items }));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Tab: Theo bàn ────────────────────────────────────────────────────────────

interface BanGroupCardProps {
  group: BanGroup;
  index: number;
}

const BanGroupCard: React.FC<BanGroupCardProps> = ({ group, index }) => {
  const totalQty = group.items.reduce((s, i) => s + parseFloat2(i.so_luong), 0);
  const totalQtyStr = totalQty % 1 === 0 ? String(totalQty) : totalQty.toFixed(2).replace(/0+$/, '');

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(280)}>
      <View style={styles.banCard}>
        {/* Card header */}
        <View style={styles.banCardHeader}>
          <View style={styles.banIconWrap}>
            <Icon name="table-chair" size={18} color={theme.colors.white} />
          </View>
          <Text style={styles.banName}>{group.ban}</Text>
          <View style={styles.banBadge}>
            <Text style={styles.banBadgeText}>{totalQtyStr} món</Text>
          </View>
        </View>

        {/* Item rows */}
        {group.items.map((item, idx) => {
          const elapsed = fmtElapsed(item.updated_at);
          const tColor = elapsedColor(item.updated_at);
          return (
            <View
              key={item.id_chi_tiet}
              style={[styles.banItemRow, idx < group.items.length - 1 && styles.banItemRowBorder]}
            >
              <View style={styles.banQtyBox}>
                <Text style={styles.banQty}>×{fmtQty(item.so_luong)}</Text>
              </View>
              <View style={styles.banItemInfo}>
                <Text style={styles.banItemName}>{item.ten_mat_hang}</Text>
                {item.ghi_chu ? (
                  <Text style={styles.banItemNote}>
                    <Icon name="note-text-outline" size={11} color={theme.colors.textTertiary} />{' '}
                    {item.ghi_chu}
                  </Text>
                ) : null}
              </View>
              <View style={styles.banRight}>
                <Text style={styles.banDonVi}>{item.ten_don_vi}</Text>
                {elapsed ? (
                  <View style={[styles.elapsedBadge, { borderColor: tColor }]}>
                    <Icon name="clock-outline" size={10} color={tColor} />
                    <Text style={[styles.elapsedText, { color: tColor }]}>{elapsed}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

// ─── Tab: Theo nhóm ───────────────────────────────────────────────────────────

interface NhomCardProps {
  item: BepXongMonTheoNhom;
  index: number;
}

const NhomCard: React.FC<NhomCardProps> = ({ item, index }) => {
  const elapsed = fmtElapsed(item.updated_at);
  const tColor  = elapsedColor(item.updated_at);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(280)}>
      <View style={styles.nhomCard}>
        {/* Top row */}
        <View style={styles.nhomTop}>
          <View style={styles.nhomQtyBadge}>
            <Text style={styles.nhomQtyText}>{fmtQty(item.tong_so_luong)}</Text>
          </View>
          <Text style={styles.nhomName} numberOfLines={2}>{item.ten_mat_hang}</Text>
          <View style={styles.nhomTagsRow}>
            {item.is_nhom_che_bien === 1 && (
              <View style={styles.nhomTag}>
                <Icon name="chef-hat" size={11} color="#D97706" />
                <Text style={styles.nhomTagText}>Bếp</Text>
              </View>
            )}
            {elapsed ? (
              <View style={[styles.elapsedBadge, { borderColor: tColor }]}>
                <Icon name="clock-outline" size={10} color={tColor} />
                <Text style={[styles.elapsedText, { color: tColor }]}>{elapsed}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Distribution row */}
        <View style={styles.nhomDistRow}>
          <Icon name="table-multiple" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.nhomDistText} numberOfLines={2}>
            {item.ten_ban_tong_so_luong}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Loading / Error / Empty states ──────────────────────────────────────────

const LoadingView = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={styles.stateText}>Đang tải...</Text>
  </View>
);

const ErrorView = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.centered}>
    <Icon name="alert-circle-outline" size={56} color={theme.colors.error} />
    <Text style={styles.errorTitle}>Lỗi kết nối</Text>
    <Text style={styles.stateText}>Không thể tải dữ liệu</Text>
    <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
      <Icon name="refresh" size={18} color={theme.colors.white} />
      <Text style={styles.retryText}>Thử lại</Text>
    </TouchableOpacity>
  </View>
);

const EmptyView = ({ message }: { message: string }) => (
  <View style={styles.centered}>
    <Icon name="check-all" size={52} color={theme.colors.success} />
    <Text style={styles.emptyTitle}>Tất cả đã xong!</Text>
    <Text style={styles.stateText}>{message}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const KitchenScreen: React.FC = () => {
  useOrderRealtime();

  const [activeTab, setActiveTab] = useState<ActiveTab>('theo-ban');

  const theoBanQuery = useQuery({
    queryKey: ['bepDonMonTheoBan'],
    queryFn: () => orderService.getBepDonMonTheoBan(),
    staleTime: 15_000,
  });

  const theoNhomQuery = useQuery({
    queryKey: ['bepXongMonTheoNhom'],
    queryFn: () => orderService.getBepXongMonTheoNhom(),
    staleTime: 15_000,
  });

  const banGroups = useMemo(
    () => groupByBan(theoBanQuery.data ?? []),
    [theoBanQuery.data]
  );

  const nhomList = theoNhomQuery.data ?? [];

  const isLoading = activeTab === 'theo-ban' ? theoBanQuery.isLoading : theoNhomQuery.isLoading;
  const isError   = activeTab === 'theo-ban' ? theoBanQuery.isError   : theoNhomQuery.isError;
  const isRefreshing =
    activeTab === 'theo-ban' ? theoBanQuery.isRefetching : theoNhomQuery.isRefetching;

  const handleRefresh = useCallback(() => {
    if (activeTab === 'theo-ban') {
      theoBanQuery.refetch();
    } else {
      theoNhomQuery.refetch();
    }
  }, [activeTab, theoBanQuery, theoNhomQuery]);

  const handleRetry = useCallback(() => {
    theoBanQuery.refetch();
    theoNhomQuery.refetch();
  }, [theoBanQuery, theoNhomQuery]);

  useRefreshOnFocus(
    useCallback(() => {
      theoBanQuery.refetch();
      theoNhomQuery.refetch();
    }, [theoBanQuery, theoNhomQuery]),
    Math.min(theoBanQuery.dataUpdatedAt, theoNhomQuery.dataUpdatedAt),
    15_000,
  );

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderBanGroup = useCallback(
    ({ item, index }: { item: BanGroup; index: number }) => (
      <BanGroupCard group={item} index={index} />
    ),
    []
  );

  const renderNhomCard = useCallback(
    ({ item, index }: { item: BepXongMonTheoNhom; index: number }) => (
      <NhomCard item={item} index={index} />
    ),
    []
  );

  const totalMonCho = (theoBanQuery.data ?? []).reduce(
    (s, i) => s + parseFloat2(i.so_luong),
    0
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.screen}>
      {/* ── Header block (header + segment tabs) ── */}
      <View style={styles.headerBlock}>
        {/* Top row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Icon name="chef-hat" size={22} color="rgba(255,255,255,0.85)" />
            <View>
              <Text style={styles.headerTitle}>Bếp</Text>
              <Text style={styles.headerSub}>
                {totalMonCho > 0
                  ? `${totalMonCho} món đang chờ`
                  : 'Không có món chờ'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            activeOpacity={0.7}
            disabled={isRefreshing}
          >
            <Icon
              name="refresh"
              size={20}
              color={isRefreshing ? 'rgba(255,255,255,0.35)' : theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Segment tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'theo-ban' && styles.tabItemActive]}
            onPress={() => setActiveTab('theo-ban')}
            activeOpacity={0.75}
          >
            <Icon
              name="table-chair"
              size={14}
              color={activeTab === 'theo-ban' ? KITCHEN_COLOR : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabLabel, activeTab === 'theo-ban' && styles.tabLabelActive]}>
              Theo bàn
            </Text>
            {(theoBanQuery.data?.length ?? 0) > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{banGroups.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'theo-nhom' && styles.tabItemActive]}
            onPress={() => setActiveTab('theo-nhom')}
            activeOpacity={0.75}
          >
            <Icon
              name="food-variant"
              size={14}
              color={activeTab === 'theo-nhom' ? KITCHEN_COLOR : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabLabel, activeTab === 'theo-nhom' && styles.tabLabelActive]}>
              Theo nhóm
            </Text>
            {nhomList.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{nhomList.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorView onRetry={handleRetry} />
      ) : activeTab === 'theo-ban' ? (
        <FlatList
          data={banGroups}
          keyExtractor={(g) => g.ban}
          renderItem={renderBanGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyView message="Không có món nào đang chờ chế biến" />
          }
        />
      ) : (
        <FlatList
          data={nhomList}
          keyExtractor={(i) => String(i.id_mat_hang)}
          renderItem={renderNhomCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyView message="Không có nhóm món nào" />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default KitchenScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const KITCHEN_COLOR  = theme.colors.primary;
const KITCHEN_LIGHT  = theme.colors.primaryLight;
const KITCHEN_BORDER = theme.colors.primaryLight;
const KITCHEN_DARK   = theme.colors.primaryDark;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Header block (header + segment tabs unified) ──────────────────────────
  headerBlock: {
    backgroundColor: KITCHEN_COLOR,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: KITCHEN_COLOR,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Segment tabs (inside header block) ───────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: BORDER_RADIUS.lg,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: theme.colors.white,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },
  tabLabelActive: {
    color: KITCHEN_COLOR,
  },
  tabBadge: {
    backgroundColor: theme.colors.warning,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    flexGrow: 1,
  },

  // ── BanGroupCard ──────────────────────────────────────────────────────────
  banCard: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  banCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KITCHEN_LIGHT,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  banIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: KITCHEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: KITCHEN_DARK,
  },
  banBadge: {
    backgroundColor: KITCHEN_COLOR,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  banBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: theme.colors.white,
  },
  banItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  banItemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  banQtyBox: {
    minWidth: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: KITCHEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KITCHEN_BORDER,
  },
  banQty: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: KITCHEN_COLOR,
  },
  banItemInfo: {
    flex: 1,
  },
  banItemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  banItemNote: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  banRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  banDonVi: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  elapsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  elapsedText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── NhomCard ──────────────────────────────────────────────────────────────
  nhomCard: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  nhomTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nhomQtyBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: KITCHEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    flexShrink: 0,
  },
  nhomQtyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: theme.colors.white,
  },
  nhomName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  nhomTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 0,
  },
  nhomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: KITCHEN_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    flexShrink: 0,
  },
  nhomTagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: KITCHEN_COLOR,
  },
  nhomDistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingLeft: 48,
  },
  nhomDistText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // ── States ────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.success,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  stateText: {
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
    borderRadius: 10,
    marginTop: SPACING.sm,
  },
  retryText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
