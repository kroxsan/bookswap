// BookSwap - BookDetailScreen
// Hafta 6: Modal kaldırıldı, "Takas Teklifi Gönder" SendOfferScreen'e yönlendiriyor

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigator';
import {bookService, Book} from '../services/api';
import Colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

const BookDetailScreen = ({route, navigation}: Props) => {
  const {bookId, currentUserId} = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await bookService.getById(bookId);
      if (result.error) {
        Alert.alert('Hata', result.error);
        navigation.goBack();
      } else {
        setBook(result.data!);
      }
      setLoading(false);
    };
    fetchData();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!book) return null;

  const isOwner = book.userId === currentUserId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kitap Detayı</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{book.category}</Text>
            </View>
            <View style={[styles.tag, styles.conditionTag]}>
              <Text style={styles.tagText}>{book.condition}</Text>
            </View>
            <View style={[styles.tag, book.status === 'Aktif' ? styles.activeTag : styles.swappedTag]}>
              <Text style={styles.tagText}>{book.status}</Text>
            </View>
          </View>

          {book.description ? (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>Açıklama</Text>
              <Text style={styles.descText}>{book.description}</Text>
            </View>
          ) : null}

          <View style={styles.ownerBox}>
            <Text style={styles.ownerIcon}>👤</Text>
            <Text style={styles.ownerText}>{book.userName}</Text>
          </View>
        </View>

        {/* Hafta 6: Modal yerine SendOffer ekranına git */}
        {!isOwner && book.status === 'Aktif' && (
          <TouchableOpacity
            style={styles.offerBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('SendOffer', {
                targetBook: {
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  userName: book.userName ?? '',
                },
              })
            }>
            <Text style={styles.offerBtnText}>🔄 Takas Teklifi Gönder</Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <View style={styles.ownerNote}>
            <Text style={styles.ownerNoteText}>Bu ilan sana ait.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {paddingVertical: 4, width: 60},
  backText: {color: Colors.white, fontSize: 15},
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: Colors.white},
  content: {padding: 16, gap: 12},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bookTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 4},
  author: {fontSize: 15, color: Colors.darkGray, marginBottom: 14},
  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  tag: {backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7},
  conditionTag: {backgroundColor: Colors.darkGray},
  activeTag: {backgroundColor: Colors.success},
  swappedTag: {backgroundColor: Colors.gray},
  tagText: {color: Colors.white, fontSize: 12, fontWeight: '600'},
  descBox: {backgroundColor: Colors.lightGray, borderRadius: 8, padding: 12, marginBottom: 14},
  descLabel: {fontSize: 12, fontWeight: '600', color: Colors.darkGray, marginBottom: 4},
  descText: {fontSize: 14, color: Colors.primary, lineHeight: 20},
  ownerBox: {flexDirection: 'row', alignItems: 'center', gap: 6},
  ownerIcon: {fontSize: 16},
  ownerText: {fontSize: 14, color: Colors.darkGray},
  offerBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  offerBtnText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
  ownerNote: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  ownerNoteText: {color: Colors.darkGray, fontSize: 14},
});

export default BookDetailScreen;
