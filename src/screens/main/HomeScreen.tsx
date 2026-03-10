import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { orderService } from '../../services/orderService';
import { PendingCancelItem, parse422Error } from '../../types/order.types';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';
import { ApprovalCard } from '../../components/orders/ApprovalCard';
import { ResolvedCard } from '../../components/orders/ResolvedCard';
import CustomAlert, { AlertType, AlertButton } from '../../component/CustomAlert';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'pending' | 'rejected';

interface AlertState {
    visible: boolean;
    type: AlertType;
    title?: string;
    message?: string;
    buttons?: AlertButton[];
}

const ALERT_HIDDEN: AlertState = { visible: false, type: 'info' };

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'pending',  label: 'Chờ duyệt', icon: 'clock-outline' },
    { key: 'rejected', label: 'Từ chối',   icon: 'close-circle-outline' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabKey>('pending');
    const [alertState, setAlertState] = useState<AlertState>(ALERT_HIDDEN);

    const hideAlert = useCallback(() => setAlertState(ALERT_HIDDEN), []);
    const showAlert = useCallback((config: Omit<AlertState, 'visible'>) => {
        setAlertState({ visible: true, ...config });
    }, []);

    useOrderRealtime();

    // ── Queries ──────────────────────────────────────────────────────────────

    const pendingQuery = useQuery({
        queryKey: ['cancel-items', 'pending'],
        queryFn: () => orderService.getPendingCancelItems(),
        staleTime: 30000,
    });

    const rejectedQuery = useQuery({
        queryKey: ['cancel-items', 'rejected'],
        queryFn: () => orderService.getResolvedCancelItems(-1),
        staleTime: 30000,
        enabled: activeTab === 'rejected',
    });

    const pendingItems  = pendingQuery.data  || [];
    const rejectedItems = rejectedQuery.data || [];

    const activeQuery = activeTab === 'pending' ? pendingQuery : rejectedQuery;
    const activeItems = activeTab === 'pending' ? pendingItems : rejectedItems;

    // ── Mutation ─────────────────────────────────────────────────────────────

    const actionMutation = useMutation({
        mutationFn: (params: { id_chi_tiet: number; type: 2 | -1 }) =>
            orderService.actionDuyet(params),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cancel-items'] });
            const label = variables.type === 2 ? 'Đã duyệt' : 'Đã từ chối';
            showAlert({ type: 'success', message: data.message || label });
        },
        onError: (error: any) => {
            const msg = error?.response?.status === 422
                ? parse422Error(error)
                : error?.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            showAlert({ type: 'error', message: msg });
        },
    });

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleApprove = useCallback((item: PendingCancelItem) => {
        showAlert({
            type: 'confirm',
            title: 'Duyệt hủy',
            message: `Duyệt hủy "${item.ten_mat_hang}" – ${item.ten_ban}?`,
            buttons: [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Duyệt',
                    style: 'default',
                    onPress: () => actionMutation.mutate({ id_chi_tiet: item.id, type: 2 }),
                },
            ],
        });
    }, [actionMutation, showAlert]);

    const handleReject = useCallback((item: PendingCancelItem) => {
        showAlert({
            type: 'confirm',
            title: 'Từ chối hủy',
            message: `Từ chối hủy "${item.ten_mat_hang}" – ${item.ten_ban}?`,
            buttons: [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Từ chối',
                    style: 'destructive',
                    onPress: () => actionMutation.mutate({ id_chi_tiet: item.id, type: -1 }),
                },
            ],
        });
    }, [actionMutation, showAlert]);

    // ── Render helpers ────────────────────────────────────────────────────────

    const renderEmptyState = useCallback(() => {
        const config = {
            pending:  { icon: 'check-decagram-outline', color: theme.colors.success,       title: 'Tất cả đã xử lý',          sub: 'Không có yêu cầu hủy nào đang chờ duyệt.' },
            approved: { icon: 'check-circle-outline',   color: theme.colors.primary,        title: 'Chưa có dữ liệu',           sub: 'Chưa có yêu cầu hủy nào được duyệt.' },
            rejected: { icon: 'close-circle-outline',   color: theme.colors.textSecondary,  title: 'Chưa có dữ liệu',           sub: 'Chưa có yêu cầu hủy nào bị từ chối.' },
        }[activeTab];

        return (
            <View style={styles.emptyContainer}>
                <Icon name={config.icon} size={72} color={config.color} />
                <Text style={styles.emptyTitle}>{config.title}</Text>
                <Text style={styles.emptySubtitle}>{config.sub}</Text>
            </View>
        );
    }, [activeTab]);

    const renderPendingCard = useCallback(
        ({ item, index }: { item: PendingCancelItem; index: number }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
                <ApprovalCard
                    item={item}
                    onApprove={() => handleApprove(item)}
                    onReject={() => handleReject(item)}
                />
            </Animated.View>
        ),
        [handleApprove, handleReject],
    );

    const renderResolvedCard = useCallback(
        ({ item, index }: { item: PendingCancelItem; index: number }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
                <ResolvedCard item={item} />
            </Animated.View>
        ),
        [],
    );

    // ── List content ──────────────────────────────────────────────────────────

    const renderListContent = () => {
        if (activeQuery.isLoading && !activeQuery.isRefetching) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            );
        }

        if (activeQuery.isError) {
            return (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={56} color={theme.colors.error} />
                    <Text style={styles.errorTitle}>Lỗi kết nối</Text>
                    <Text style={styles.errorSubtitle}>Không thể tải dữ liệu</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => activeQuery.refetch()}
                    >
                        <Icon name="refresh" size={18} color={theme.colors.white} />
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={activeItems}
                renderItem={activeTab === 'pending' ? renderPendingCard : renderResolvedCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    activeItems.length === 0 && styles.listContentEmpty,
                ]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={activeQuery.isRefetching}
                        onRefresh={() => activeQuery.refetch()}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                        title="Đang tải..."
                        titleColor={theme.colors.textSecondary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        );
    };

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            {/* Header + Tabs */}
            <View style={styles.headerBlock}>
                {/* Top row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <Icon name="clipboard-check-outline" size={22} color="rgba(255,255,255,0.85)" />
                        <View>
                            <Text style={styles.headerTitle}>Duyệt yêu cầu</Text>
                            <Text style={styles.headerSubtitle}>
                                {pendingItems.length > 0
                                    ? `${pendingItems.length} yêu cầu đang chờ`
                                    : 'Không có yêu cầu mới'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={() => activeQuery.refetch()}
                        activeOpacity={0.7}
                        disabled={activeQuery.isRefetching}
                    >
                        <Icon
                            name="refresh"
                            size={20}
                            color={activeQuery.isRefetching
                                ? 'rgba(255,255,255,0.35)'
                                : theme.colors.white}
                        />
                    </TouchableOpacity>
                </View>

                {/* Segment tabs */}
                <View style={styles.tabContainer}>
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const showCount = tab.key === 'pending' && pendingItems.length > 0;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tabItem, isActive && styles.tabItemActive]}
                                onPress={() => setActiveTab(tab.key)}
                                activeOpacity={0.75}
                            >
                                <Icon
                                    name={tab.icon}
                                    size={14}
                                    color={isActive ? theme.colors.primary : 'rgba(255,255,255,0.6)'}
                                />
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                    {tab.label}
                                </Text>
                                {showCount && (
                                    <View style={styles.tabBadge}>
                                        <Text style={styles.tabBadgeText}>{pendingItems.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* List */}
            {renderListContent()}

            <CustomAlert
                visible={alertState.visible}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                buttons={alertState.buttons}
                onDismiss={hideAlert}
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

    // Header block (header + tabs unified)
    headerBlock: {
        backgroundColor: theme.colors.primary,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        gap: SPACING.md,
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
    headerSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 2,
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Segment tabs (inside header block)
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
        color: theme.colors.primary,
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

    // List
    listContent: {
        paddingTop: SPACING.xs,
        paddingBottom: 24,
    },
    listContentEmpty: {
        flex: 1,
    },

    // Loading
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

    // Error
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
        borderRadius: 10,
        marginTop: SPACING.sm,
    },
    retryButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.white,
    },

    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
        marginTop: 80,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: SPACING.md,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default HomeScreen;
