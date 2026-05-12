// BookSwap - BookDetailScreen
// Hafta 5: Kitap detayı — kitap bilgileri ve ilan sahibinin bilgisi

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {bookService, Book} from '../services/api';
import {RootStackParamList} from '../navigation/RootNavigator';
import Colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

const CONDITIONS_MAP: Record<string, {icon: string; color: string}> = {
  'Yeni':       {icon: '🟢', color: '#27AE60'},
  'İyi':        {icon: '🔵', color: '#2980B9'},
  'Orta':       {icon: '🟡', color: '#F39C12'},
  'Yıpranmış':  {icon: '🔴', color: '#E74C3C'},
};

const BookDetailScreen = ({route, navigation}: Props) => {
  const {bookId} = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const result = await bookService.getById(bookId);
      if (result.error) {
        Alert.alert('Hata', result.error);
        navigation.goBack();
      } else {
        setBook(result.data!);
      }
      setLoading(false);
    };
    fetch();
  }, [bookId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!book) return null;

  const cond = CONDITIONS_MAP[book.condition] ?? {icon: '⚪', color: Colors.gray};

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Geri Butonu */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kitap Detayı</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kitap Kapağı Placeholder */}
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverEmoji}>📚</Text>
        </View>

        {/* Başlık ve Yazar */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        {/* Bilgi Satırları */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>Kategori</Text>
            <Text style={styles.infoBadgeValue}>{book.category}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>Durum</Text>
            <Text style={[styles.infoBadgeValue, {color: cond.color}]}>
              {cond.icon} {book.condition}
            </Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>Tarih</Text>
            <Text style={styles.infoBadgeValue}>
              {new Date(book.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Açıklama */}
        {book.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.sectionText}>{book.description}</Text>
          </View>
        ) : null}

        {/* İlan Sahibi */}
        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>
              {book.userName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.ownerLabel}>İlan Sahibi</Text>
            <Text style={styles.ownerName}>{book.userName}</Text>
          </View>
        </View>

        {/* Teklif Gönder Butonu — Hafta 6'da aktif olacak */}
        <TouchableOpacity
          style={styles.offerBtn}
          onPress={() =>
            Alert.alert(
              'Yakında!',
              'Takas teklifi gönderme özelliği Hafta 6\'da eklenecek.',
            )
          }
          activeOpacity={0.85}>
          <Text style={styles.offerBtnText}>🔄 Takas Teklifi Gönder</Text>
        </TouchableOpacity>

        <Text style={styles.weekBadge}>Hafta 5 ✅</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {width: 60},
  backText: {color: Colors.accent, fontSize: 15, fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: 'bold', color: Colors.white},
  content: {padding: 20, paddingBottom: 40},
  coverPlaceholder: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  coverEmoji: {fontSize: 72},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  infoBadge: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
  },
  infoBadgeLabel: {fontSize: 11, color: Colors.gray, marginBottom: 4},
  infoBadgeValue: {fontSize: 13, fontWeight: '600', color: Colors.primary, textAlign: 'center'},
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 8},
  sectionText: {fontSize: 14, color: Colors.darkGray, lineHeight: 22},
  ownerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 1,
    gap: 14,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {fontSize: 20, fontWeight: 'bold', color: Colors.white},
  ownerLabel: {fontSize: 12, color: Colors.gray, marginBottom: 2},
  ownerName: {fontSize: 16, fontWeight: 'bold', color: Colors.primary},
  offerBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  offerBtnText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
  weekBadge: {textAlign: 'center', color: Colors.gray, fontSize: 12},
});

export default BookDetailScreen;
