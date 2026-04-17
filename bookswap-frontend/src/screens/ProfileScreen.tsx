

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigator';
import {TabParamList} from '../navigation/MainTabs';
import {clearToken} from '../services/api';
import Colors from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profil'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ProfileScreen = ({navigation, route}: Props) => {
  const {userName} = route.params;

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istiyor musun?', [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => {
          clearToken();
          navigation.replace('Login'); //login'e geri at
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{userName}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Hafta 4 ✅</Text>
          <Text style={styles.infoText}>
            Kitap ilan yönetimi tamamlandı.{'\n'}
            Hafta 5'te arama ve filtreleme gelecek.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {fontSize: 32, fontWeight: 'bold', color: Colors.white},
  name: {fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 24},
  infoBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    elevation: 2,
  },
  infoLabel: {fontSize: 16, fontWeight: 'bold', color: Colors.accent, marginBottom: 8},
  infoText: {fontSize: 14, color: Colors.darkGray, textAlign: 'center', lineHeight: 22},
  logoutBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 40,
    paddingVertical: 13,
    borderRadius: 10,
  },
  logoutText: {color: Colors.white, fontSize: 15, fontWeight: 'bold'},
});

export default ProfileScreen;
