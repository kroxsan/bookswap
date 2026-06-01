// BookSwap - SendOfferScreen
// Hafta 6: Kendi aktif kitaplarını listeler, birini seçip teklif gönderir

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {bookService, offerService, Book} from '../services/api';
import {RootStackParamList} from '../navigation/RootNavigator';
import Colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SendOffer'>;

const SendOfferScreen = ({route, navigation}: Props) => {
  const {targetBook} = route.params;

  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMyBooks = async () => {
      const result = await bookService.getMy();
      if (result.error) {
        Alert.alert('Hata', result.error);
      } else {
        // Sadece aktif olan ve hedef kitap olmayan kendi kitaplarını göster
        const aktif = (result.data ?? []).filter(
          b => b.status === 'Aktif' && b.id !== targetBook.id,
        );
        setMyBooks(aktif);
      }
      setLoading(false);
    };
    fetchMyBooks();
  }, [targetBook.id]);

  const handleSend = async () => {
    if (!selectedBookId) {
      Alert.alert('Hata', 'Teklif etmek istediğin kitabı seç.');
      return;
    }

    setSending(true);
    const result = await offerService.create(targetBook.id, selectedBookId);
    setSending(false);

    if (result.error) {
      Alert.alert('Hata', result.error);
      return;
    }

    Alert.alert(
      'Teklif Gönderildi! 🎉',
      `"${targetBook.title}" için takas teklifin iletildi.`,
      [{text: 'Tamam', onPress: () => navigation.goBack()}],
    );
  };

  const renderBook = ({item}: {item: Book}) => {
    const selected = selectedBookId === item.id;
    return (
      <TouchableOpacity
        style={[styles.bookCard, selected && styles.bookCardSelected]}
        activeOpacity={0.8}
        onPress={() => setSelectedBookId(selected ? null : item.id)}>
        <View style={styles.bookCardLeft}>
          <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
            {selected && <View style={styles.radioDot} />}
          </View>
          <View style={styles.bookInfo}>
            <Text
              style={[styles.bookTitle, selected && styles.bookTitleSelected]}
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            <View style={styles.bookMeta}>
              <Text style={styles.bookMetaText}>{item.category}</Text>
              <Text style={styles.bookMetaDot}> · </Text>
              <Text style={styles.bookMetaText}>{item.condition}</Text>
            </View>
          </View>
        </View>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teklif Gönder</Text>
        <View style={{width: 60}} />
      </View>

      {/* Hedef kitap bilgisi */}
      <View style={styles.targetCard}>
        <Text style={styles.targetLabel}>Takas İstediğin Kitap</Text>
        <Text style={styles.targetTitle}>{targetBook.title}</Text>
        <Text style={styles.targetMeta}>
          {targetBook.author} · {targetBook.userName}
        </Text>
      </View>

      {/* Karşılık kitap seçimi */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Karşılık Vereceğin Kitabını Seç</Text>
        <Text style={styles.sectionSub}>Aktif ilanlarından birini seç</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : myBooks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aktif ilanın yok.</Text>
          <Text style={styles.emptySubText}>
            Teklif gönderebilmek için önce İlanlarım{'\n'}sekmesinden bir kitap ekle.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myBooks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBook}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Gönder butonu */}
      {myBooks.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!selectedBookId || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!selectedBookId || sending}
            activeOpacity={0.85}>
            {sending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.sendBtnText}>🔄 Teklifi Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {width: 60},
  backText: {color: Colors.white, fontSize: 15, fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: 'bold', color: Colors.white},
  targetCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  targetLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetTitle: {fontSize: 17, fontWeight: 'bold', color: Colors.white, marginBottom: 4},
  targetMeta: {fontSize: 13, color: Colors.gray},
  sectionHeader: {paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8},
  sectionTitle: {fontSize: 15, fontWeight: 'bold', color: Colors.primary},
  sectionSub: {fontSize: 13, color: Colors.darkGray, marginTop: 2},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyText: {fontSize: 16, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 8},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22},
  list: {paddingHorizontal: 16, paddingBottom: 16, gap: 10},
  bookCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  bookCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#FFF8F3',
  },
  bookCardLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {borderColor: Colors.accent},
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  bookInfo: {flex: 1},
  bookTitle: {fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 2},
  bookTitleSelected: {color: Colors.accent},
  bookAuthor: {fontSize: 12, color: Colors.darkGray, marginBottom: 4},
  bookMeta: {flexDirection: 'row', alignItems: 'center'},
  bookMetaText: {fontSize: 11, color: Colors.gray},
  bookMetaDot: {fontSize: 11, color: Colors.gray},
  checkmark: {fontSize: 18, color: Colors.accent, marginLeft: 8},
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendBtnDisabled: {opacity: 0.45},
  sendBtnText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
});

export default SendOfferScreen;
