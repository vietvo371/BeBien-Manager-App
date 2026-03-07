import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, NavigationProp } from '@react-navigation/native';
import api from "./Api";
import Toast from "react-native-toast-message";

export const saveToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('@auth_token', token);
        console.log('Token saved successfully');
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
}

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem('@auth_token');
        console.log('Token removed successfully');
    } catch (error) {
        console.error('Error removing token:', error);
        throw error;
    }
}

export const checkToken = async (navigation: NavigationProp<any>) => {
    try {
        const token = await getToken();
        if (token) {
            // Use Student API: GET /api/student/me
            // Actual API format: { status: true, data: { student: {...} } }
            const res = await api.get('/api/student/me');

            if (res.data?.status === true && res.data?.data?.student) {
                // Token is valid, user data received
                const userData = res.data.data.student;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                return true;
            } else {
                // Token is invalid, clear it and redirect to login
                await removeToken();
                await AsyncStorage.removeItem('user');
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    })
                );
                Toast.show({
                    text1: 'Vui lòng đăng nhập hệ thống!',
                    type: 'error',
                });
                return false;
            }
        } else {
            // No token found
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                })
            );
            return false;
        }
    } catch (error: any) {
        console.error('Error checking token:', error);

        // Handle 401 Unauthenticated: API returns { "message": "Unauthenticated." }
        // This means token is invalid or expired
        if (error.response?.status === 401) {
            console.log('Token is invalid or expired (401 Unauthenticated)');
        }

        // On error, clear token and redirect to login
        await removeToken();
        await AsyncStorage.removeItem('user');
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
            })
        );
        Toast.show({
            text1: 'Vui lòng đăng nhập hệ thống!',
            type: 'error',
        });
        return false;
    }
}
export const saveUser = async (user: any) => {
    try {
        if (!user) {
            console.warn('saveUser called with null/undefined user');
            return;
        }
        await AsyncStorage.setItem('@user_data', JSON.stringify(user));
        console.log('User saved successfully');
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
}
export const getUser = async () => {
    try {
        const user = await AsyncStorage.getItem('@user_data');
        return JSON.parse(user || '{}');
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}
export const removeUser = async () => {
    try {
        await AsyncStorage.removeItem('@user_data');
        console.log('User removed successfully');
    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
}