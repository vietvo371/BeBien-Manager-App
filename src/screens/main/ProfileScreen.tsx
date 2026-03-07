import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BUTTON_HEIGHT, BORDER_RADIUS } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Icon name="account-circle" size={80} color={theme.colors.primary} />
                </View>

                {/* User Info */}
                <Text style={styles.name}>{user?.full_name || 'Người dùng'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Icon name="logout" size={20} color={theme.colors.white} />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    avatarContainer: {
        marginBottom: SPACING.lg,
    },
    name: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        marginBottom: SPACING['2xl'],
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error,
        height: BUTTON_HEIGHT.lg,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING['2xl'],
        gap: SPACING.sm,
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
});

export default ProfileScreen;
