import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE } from '../../theme';

const HomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Icon name="home-variant" size={64} color={theme.colors.primary} />
                <Text style={styles.title}>Trang chủ</Text>
                <Text style={styles.subtitle}>
                    Chào mừng đến với BeBien Manager
                </Text>
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
    title: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default HomeScreen;
