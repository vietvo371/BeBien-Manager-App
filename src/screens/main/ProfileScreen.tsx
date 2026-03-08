import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, SPACING, FONT_SIZE, BUTTON_HEIGHT, BORDER_RADIUS } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
    const { user, signOut } = useAuth();

    const handleLogout = useCallback(() => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ]
        );
    }, [signOut]);

    const menuItems = [
        {
            icon: 'account-edit-outline',
            title: 'Thông tin cá nhân',
            subtitle: 'Quản lý thông tin tài khoản',
            onPress: () => console.log('Thông tin cá nhân'),
        },
        {
            icon: 'shield-lock-outline',
            title: 'Bảo mật',
            subtitle: 'Đổi mật khẩu, mã PIN',
            onPress: () => console.log('Bảo mật'),
        },
        {
            icon: 'bell-outline',
            title: 'Thông báo',
            subtitle: 'Cài đặt thông báo ứng dụng',
            onPress: () => console.log('Thông báo'),
        },
        {
            icon: 'help-circle-outline',
            title: 'Hỗ trợ',
            subtitle: 'Liên hệ trung tâm trợ giúp',
            onPress: () => console.log('Hỗ trợ'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tài khoản</Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* User Info Card */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(300)}
                    style={styles.profileCard}
                >
                    <View style={styles.avatarContainer}>
                        <Icon name="account-circle" size={64} color={theme.colors.primary} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{user?.full_name || 'Người dùng'}</Text>
                        <Text style={styles.email}>{user?.email || 'Chưa cập nhật email'}</Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>Nhân viên</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(200 + index * 50).duration(300)}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.menuIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                                    <Icon name={item.icon} size={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    {item.subtitle && (
                                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                    )}
                                </View>
                                <Icon name="chevron-right" size={24} color={theme.colors.textTertiary || theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Action Section */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(300)}
                    style={styles.actionSection}
                >
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Icon name="logout" size={20} color={theme.colors.error} />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
                </Animated.View>
            </ScrollView>
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
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    avatarContainer: {
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    roleContainer: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
    },
    roleText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: SPACING.md,
    },
    menuSection: {
        marginBottom: SPACING.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.text,
    },
    menuSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    actionSection: {
        alignItems: 'center',
        gap: SPACING.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: theme.colors.card,
        height: BUTTON_HEIGHT.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: theme.colors.error,
        gap: SPACING.sm,
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.error,
    },
    versionText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textTertiary || theme.colors.textSecondary,
    },
});

export default ProfileScreen;
