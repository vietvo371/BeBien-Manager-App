import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, SPACING, FONT_SIZE } from '../../theme';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/order.types';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';
import { alertPrompt } from '../../utils/alertPrompt';
import { ApprovalCard } from '../../components/orders/ApprovalCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const queryClient = useQueryClient();

    // Lắng nghe realtime sự kiện huỷ đơn
    useOrderRealtime();

    // Load danh sách đơn chờ duyệt huỷ
    const {
        data,
        refetch,
        isLoading,
        isRefetching,
        isError,
    } = useQuery({
        queryKey: ['orders', { cancellation_status: 'pending' }],
        queryFn: () => orderService.getOrders(1, 50, { cancellation_status: 'pending' }),
        staleTime: 30000,
    });

    const orders = data?.data?.orders || [];

    const approveMutation = useMutation({
        mutationFn: (orderId: number) => orderService.approveCancellation(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            Alert.alert('Thành công', 'Đã duyệt yêu cầu hủy đơn hàng');
        },
        onError: (error: any) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể duyệt đơn hàng');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (params: { orderId: number; reason: string }) =>
            orderService.rejectCancellation(params.orderId, params.reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            Alert.alert('Thành công', 'Đã từ chối yêu cầu hủy đơn hàng');
        },
        onError: (error: any) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể từ chối yêu cầu');
        },
    });

    const handleOrderPress = useCallback((order: Order) => {
        navigation.navigate('OrderDetail', { orderId: order.id });
    }, [navigation]);

    const handleApprove = useCallback((order: Order) => {
        Alert.alert(
            'Duyệt hủy đơn',
            `Bạn có chắc chắn muốn duyệt hủy đơn hàng #${order.order_code}?`,
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Duyệt',
                    style: 'destructive',
                    onPress: () => approveMutation.mutate(order.id),
                },
            ]
        );
    }, [approveMutation]);

    const handleReject = useCallback((order: Order) => {
        alertPrompt(
            'Từ chối hủy đơn',
            'Vui lòng nhập lý do từ chối yêu cầu hủy đơn',
            [
                { text: 'Hủy bỏ', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: (reason) => {
                        if (reason?.trim()) {
                            rejectMutation.mutate({
                                orderId: order.id,
                                reason: reason.trim(),
                            });
                        } else {
                            Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
                        }
                    },
                },
            ],
            'plain-text'
        );
    }, [rejectMutation]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="check-decagram-outline" size={80} color={theme.colors.success} />
            <Text style={styles.emptyTitle}>Tất cả đã xử lý</Text>
            <Text style={styles.emptySubtitle}>
                Tuyệt vời! Không có yêu cầu hủy đơn nào đang chờ duyệt.
            </Text>
        </View>
    );

    const renderApprovalCard = useCallback(
        ({ item, index }: { item: Order; index: number }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                <ApprovalCard
                    order={item}
                    onPress={() => handleOrderPress(item)}
                    onApprove={() => handleApprove(item)}
                    onReject={() => handleReject(item)}
                />
            </Animated.View>
        ),
        [handleOrderPress, handleApprove, handleReject]
    );

    if (isLoading && !isRefetching) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Duyệt yêu cầu</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải danh sách chờ duyệt...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Duyệt yêu cầu</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text style={styles.errorTitle}>Lỗi kết nối</Text>
                    <Text style={styles.errorSubtitle}>Không thể tải danh sách chờ duyệt</Text>
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
                <Text style={styles.headerTitle}>Duyệt yêu cầu</Text>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{orders.length}</Text>
                </View>
            </View>

            <FlatList
                data={orders}
                renderItem={renderApprovalCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    orders.length === 0 && styles.listContentEmpty,
                ]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => refetch()}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                        title="Đang tải..."
                        titleColor={theme.colors.textSecondary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
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
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
    headerTitle: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '800',
        color: theme.colors.white,
    },
    badgeContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginLeft: SPACING.sm,
    },
    badgeText: {
        color: theme.colors.primary,
        fontSize: FONT_SIZE.xs,
        fontWeight: '800',
    },
    listContent: {
        paddingVertical: SPACING.sm,
        paddingBottom: 20,
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
        borderRadius: 8,
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
        marginTop: SPACING['3xl'] * 2,
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
        lineHeight: 22,
    },
});

export default HomeScreen;
