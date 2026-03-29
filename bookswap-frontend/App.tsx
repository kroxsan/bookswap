/**
 * BookSwap - Kampüs İkinci El Kitap Takas Platformu
 * App.tsx - Hafta 1: Temel uygulama giriş noktası
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <View style={styles.content}>
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>BookSwap</Text>
        <Text style={styles.subtitle}>
          Kampüs İkinci El Kitap Takas Platformu
        </Text>
        <View style={styles.divider} />
        <Text style={styles.weekBadge}>Hafta 1 ✅</Text>
        <Text style={styles.info}>Proje kurulumu tamamlandı.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#BDC3C7',
    textAlign: 'center',
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#E67E22',
    marginBottom: 32,
  },
  weekBadge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default App;
