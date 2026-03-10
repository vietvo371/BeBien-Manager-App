import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert, { AlertButton } from '../../component/CustomAlert';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Lấy chữ cái đầu của tên để làm avatar */
const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Format số điện thoại 0901234567 → 0901 234 567 */
const formatPhone = (phone?: string): string => {
    if (!phone) return '—';
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileScreen: React.FC = () => {
    const { user, signOut } = useAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showConfirm = useCallback(
        (title: string, message: string, buttons: AlertButton[]) => {
            setAlertTitle(title);
            setAlertMessage(message);
            setAlertButtons(buttons);
            setAlertVisible(true);
        },
        []
    );

    const handleLogout = useCallback(() => {
        showConfirm(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => signOut(),
                },
            ]
        );
    }, [showConfirm, signOut]);

    const initials = getInitials(user?.ten_nguoi_kiem_duyet);
    const displayName = user?.ten_nguoi_kiem_duyet || 'Người dùng';
    const displayPhone = formatPhone(user?.so_dien_thoai);

    // ── Info rows ─────────────────────────────────────────────────────────────

    const infoRows: { icon: string; label: string; value: string; color?: string }[] = [
        {
            icon: 'phone-outline',
            label: 'Số điện thoại',
            value: displayPhone,
        },
        {
            icon: 'shield-check-outline',
            label: 'Vai trò',
            value: 'Người kiểm duyệt',
            color: theme.colors.primary,
        },
        {
            icon: 'circle-outline',
            label: 'Trạng thái',
            value: 'Đang hoạt động',
            color: theme.colors.success,
        },
    ];

    const appRows: { icon: string; label: string; value: string }[] = [
        { icon: 'information-outline', label: 'Phiên bản', value: '1.0.0' },
        { icon: 'server-network', label: 'Máy chủ', value: 'bebien.dzfullstackmid.io.vn' },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tài khoản</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar + Name card */}
                <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.profileCard}>
                    <Image source={require('../../assets/images/logo.png')} style={styles.avatarImage} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.displayPhone}>{displayPhone}</Text>
                        <View style={styles.roleBadge}>
                            <Icon name="shield-check" size={12} color={theme.colors.primary} />
                            <Text style={styles.roleBadgeText}>Người kiểm duyệt</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Thông tin tài khoản */}
                <Animated.View entering={FadeInDown.delay(120).duration(300)}>
                    <Text style={styles.sectionLabel}>Thông tin tài khoản</Text>
                    <View style={styles.card}>
                        {infoRows.map((row, idx) => (
                            <View
                                key={row.label}
                                style={[
                                    styles.infoRow,
                                    idx < infoRows.length - 1 && styles.infoRowBorder,
                                ]}
                            >
                                <View style={styles.infoIconWrap}>
                                    <Icon name={row.icon} size={18} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.infoLabel}>{row.label}</Text>
                                <Text style={[styles.infoValue, row.color ? { color: row.color } : null]}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Ứng dụng */}
                <Animated.View entering={FadeInDown.delay(180).duration(300)}>
                    <Text style={styles.sectionLabel}>Ứng dụng</Text>
                    <View style={styles.card}>
                        {appRows.map((row, idx) => (
                            <View
                                key={row.label}
                                style={[
                                    styles.infoRow,
                                    idx < appRows.length - 1 && styles.infoRowBorder,
                                ]}
                            >
                                <View style={styles.infoIconWrap}>
                                    <Icon name={row.icon} size={18} color={theme.colors.textSecondary} />
                                </View>
                                <Text style={styles.infoLabel}>{row.label}</Text>
                                <Text style={[styles.infoValue, styles.infoValueMuted]}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Logout */}
                <Animated.View entering={FadeInDown.delay(240).duration(300)} style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Icon name="logout" size={20} color={theme.colors.error} />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <CustomAlert
                visible={alertVisible}
                type="confirm"
                title={alertTitle}
                message={alertMessage}
                buttons={alertButtons}
                onDismiss={() => setAlertVisible(false)}
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
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        marginBottom: SPACING.lg,
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

    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 40,
    },

    // Profile card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: BORDER_RADIUS.xl || 20,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: { elevation: 3 },
        }),
    },
    avatarImage: {
        width: 68,
        height: 68,
        borderRadius: 34,
    },
    avatarCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.white,
        letterSpacing: 1,
    },
    profileInfo: {
        flex: 1,
        gap: 4,
    },
    displayName: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.text,
    },
    displayPhone: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.md,
        gap: 4,
        marginTop: 4,
    },
    roleBadgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: theme.colors.primary,
    },

    // Sections
    sectionLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        overflow: 'hidden',
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    infoIconWrap: {
        width: 32,
        alignItems: 'center',
    },
    infoLabel: {
        flex: 1,
        fontSize: FONT_SIZE.md,
        color: theme.colors.text,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.text,
        fontWeight: '600',
    },
    infoValueMuted: {
        color: theme.colors.textSecondary,
        fontWeight: '400',
        fontSize: FONT_SIZE.sm,
    },

    // Logout
    logoutSection: {
        marginTop: SPACING.sm,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: BUTTON_HEIGHT.md,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: theme.colors.card,
        borderWidth: 1.5,
        borderColor: theme.colors.error,
        gap: SPACING.sm,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.error,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: { elevation: 2 },
        }),
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.error,
    },
});

export default ProfileScreen;
