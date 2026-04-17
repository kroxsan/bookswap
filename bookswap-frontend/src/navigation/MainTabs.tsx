

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './RootNavigator';
import HomeScreen from '../screens/HomeScreen';
import MyBooksScreen from '../screens/MyBooksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Colors from '../theme/colors';

export type TabParamList = {
  'Ana Sayfa': undefined;
  'İlanlarım': undefined;
  'Profil': {userName: string};
};

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = ({route}: Props) => {
  const {userName} = route.params;

  return (
    <Tab.Navigator
      screenOptions={({route: tabRoute}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray,
        tabBarIcon: ({focused}) => {
          let icon = '📚';
          if (tabRoute.name === 'Ana Sayfa') icon = '🏠';
          if (tabRoute.name === 'İlanlarım') icon = '📖';
          if (tabRoute.name === 'Profil') icon = '👤';
          return <Text style={{fontSize: focused ? 22 : 20}}>{icon}</Text>;
        },
      })}>
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="İlanlarım" component={MyBooksScreen} />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        initialParams={{userName}}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
