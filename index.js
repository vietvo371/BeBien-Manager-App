/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Setup background message handler (PHẢI ở ngoài component)
// Xử lý notifications khi app ở background hoặc quit state
getMessaging(getApp()).setBackgroundMessageHandler(async remoteMessage => {
  console.log('📱 Background notification received:', remoteMessage);
  
  // Background handler không cần làm gì đặc biệt
  // iOS/Android sẽ tự động hiển thị notification
  // Khi user tap notification → app mở → onNotificationOpenedApp() được gọi
});

AppRegistry.registerComponent(appName, () => App);
