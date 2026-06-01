// BookSwap - RootNavigator
// Hafta 6: SendOfferScreen eklendi

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabs from './MainTabs';
import BookDetailScreen from '../screens/BookDetailScreen';
import SendOfferScreen from '../screens/SendOfferScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: {userName: string; userId: number};
  BookDetail: {bookId: number; currentUserId: number};
  SendOffer: {targetBook: {id: number; title: string; author: string; userName: string}};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="SendOffer" component={SendOfferScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
