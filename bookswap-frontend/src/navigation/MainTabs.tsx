// BookSwap - MainTabs
// Hafta 7: Bildirimler sekmesi eklendi, okunmamış badge gösteriliyor
// Hafta 9: swapCount route param forward edildi

import React, {useState, useCallback} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from './RootNavigator';
import HomeScreen from '../screens/HomeScreen';
import MyBooksScreen from '../screens/MyBooksScreen';
import OffersScreen from '../screens/OffersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {notificationService} from '../services/api';
import Colors from '../theme/colors';

export type TabParamList = {
  'Ana Sayfa': undefined;
  'İlanlarım': undefined;
  'Teklifler': undefined;
  'Bildirimler': undefined;
  'Profil': {userName: string; userId: number; swapCount: number};
};

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = ({route}: Props) => {
  const {userName, userId, swapCount} = route.params;
  const [unreadCount, setUnreadCount] = useState(0);

  // Sekmeye her geçişte okunmamış sayısını güncelle
  const fetchUnread = useCallback(() => {
    notificationService.getUnreadCount().then(result => {
      if (result.data) setUnreadCount(result.data.count);
    });
  }, []);

  useFocusEffect(fetchUnread);

  return (
    <Tab.Navigator
      screenOptions={({route: tabRoute}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 62,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray,
        tabBarIcon: ({focused}) => {
          let icon = '📚';
          if (tabRoute.name === 'Ana Sayfa')  icon = '🏠';
          if (tabRoute.name === 'İlanlarım')  icon = '📖';
          if (tabRoute.name === 'Teklifler')  icon = '🔄';
          if (tabRoute.name === 'Bildirimler') icon = '🔔';
          if (tabRoute.name === 'Profil')     icon = '👤';

          // Bildirimler sekmesinde okunmamış badge
          if (tabRoute.name === 'Bildirimler' && unreadCount > 0) {
            return (
              <View>
                <Text style={{fontSize: focused ? 22 : 20}}>{icon}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              </View>
            );
          }

          return <Text style={{fontSize: focused ? 22 : 20}}>{icon}</Text>;
        },
      })}>
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="İlanlarım" component={MyBooksScreen} />
      <Tab.Screen name="Teklifler" component={OffersScreen} />
      <Tab.Screen
        name="Bildirimler"
        component={NotificationsScreen}
        listeners={{
          tabPress: () => {
            // Sekmeye basınca badge'i kısa gecikmeyle güncelle
            setTimeout(fetchUnread, 1000);
          },
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        initialParams={{userName, userId, swapCount}}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default MainTabs;
