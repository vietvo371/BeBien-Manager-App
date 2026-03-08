import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Order: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  OrderDetail: { orderId: number };
};

export type RootStackScreen<T extends keyof RootStackParamList> = React.FC<
  NativeStackScreenProps<RootStackParamList, T>
>;

export type MainTabScreen<T extends keyof MainTabParamList> = React.FC<
  BottomTabScreenProps<MainTabParamList, T>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
