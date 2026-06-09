// BookSwap - HomeScreen
// Hafta 10: Kart tasarımı iyileştirildi — sol renkli accent çizgisi, daha belirgin shadow, kitap bilgisi düzeni

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {bookService, Book} from '../services/api';
import {RootStackParamList} from '../navigation/RootNavigator';
import Colors from '../theme/colors';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = ['Tümü', 'Roman', 'Ders Kitabı', 'Bilim', 'Tarih', 'Kişisel Gelişim', 'Diğer'];
const CONDITIONS_MAP: Record<string, {icon: string; color: string}> = {
  'Yeni':      {icon: '🟢', color: '#1DB954'},
  'İyi':       {icon: '🔵', color: '#2980B9'},
  'Orta':      {icon: '🟡', color: '#F39C12'},
  'Yıpranmış': {icon: '🔴', color: '#E74C3C'},
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searching, setSearching] = useState(false);

  const fetchBooks = async () => {
    const result = await bookService.getAll();
    if (result.error) Alert.alert('Hata', result.error);
    else setBooks(result.data ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setSearchText('');
      setSelectedCategory('Tümü');
      fetchBooks();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setSearchText('');
    setSelectedCategory('Tümü');
    fetchBooks();
  };

  const handleSearch = useCallback(async (text: string, category: string) => {
    if (!text.trim() && category === 'Tümü') {
      setSearching(false);
      fetchBooks();
      return;
    }
    setSearching(true);
    const result = await bookService.search({
      q: text.trim() || undefined,
      category: category !== 'Tümü' ? category : undefined,
    });
    setSearching(false);
    if (result.error) Alert.alert('Hata', result.error);
    else setBooks(result.data ?? []);
  }, []);

  const onSearchChange = (text: string) => {
    setSearchText(text);
    handleSearch(text, selectedCategory);
  };

  const onCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    handleSearch(searchText, cat);
  };

  // Hafta 10: iyileştirilmiş kart tasarımı
  const renderBook = ({item}: {item: Book}) => {
    const cond = CONDITIONS_MAP[item.condition] ?? {icon: '⚪', color: Colors.gray};
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.82}
        onPress={() => navigation.navigate('BookDetail', {bookId: item.id})}>

        {/* Sol accent çizgisi — Hafta 10 */}
        <View style={styles.cardAccentBar} />

        <View style={styles.cardInner}>
          {/* Üst satır: kategori badge + durum */}
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={[styles.conditionBadge, {backgroundColor: cond.color + '18'}]}>
              <Text style={[styles.conditionText, {color: cond.color}]}>
                {cond.icon} {item.condition}
              </Text>
            </View>
          </View>

          {/* Kitap başlık ve yazar */}
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>

          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          ) : null}

          {/* Alt satır: sahip + tarih */}
          <View style={styles.cardFooter}>
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerAvatarText}>
                  {item.userName?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.ownerText}>{item.userName}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📚 BookSwap</Text>
          <Text style={styles.headerSub}>Aktif İlanlar</Text>
        </View>
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{books.length} ilan</Text>
          </View>
        )}
      </View>

      {/* Arama */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Kitap adı veya yazar ara..."
            placeholderTextColor={Colors.placeholder}
            value={searchText}
            onChangeText={onSearchChange}
            clearButtonMode="while-editing"
          />
          {searching && <ActivityIndicator size="small" color={Colors.accent} style={{marginRight: 8}} />}
        </View>
      </View>

      {/* Kategori filtreleri */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              onPress={() => onCategorySelect(cat)}>
              <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : books.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {searchText || selectedCategory !== 'Tümü' ? 'Sonuç bulunamadı.' : 'Henüz ilan yok.'}
          </Text>
          <Text style={styles.emptySubText}>
            {!searchText && selectedCategory === 'Tümü'
              ? 'İlanlarım sekmesinden kitap ekleyebilirsin.'
              : 'Farklı bir arama dene.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBook}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} tintColor={Colors.accent} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  headerSub: {fontSize: 12, color: Colors.gray, marginTop: 1},
  countBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {color: Colors.white, fontSize: 12, fontWeight: '700'},
  searchContainer: {backgroundColor: Colors.primary, paddingHorizontal: 16, paddingBottom: 14},
  searchBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {fontSize: 16, marginRight: 6},
  searchInput: {flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.primary},
  filterWrapper: {backgroundColor: Colors.primary, paddingBottom: 14},
  filterRow: {paddingHorizontal: 16, gap: 8},
  filterChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {backgroundColor: Colors.accent, borderColor: Colors.accent},
  filterChipText: {fontSize: 13, color: Colors.gray},
  filterChipTextActive: {color: Colors.white, fontWeight: '600'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {fontSize: 16, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 6},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center'},
  list: {padding: 16, gap: 12},

  // Hafta 10: yeni kart stili
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.10,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardAccentBar: {
    width: 4,
    backgroundColor: Colors.accent,
  },
  cardInner: {flex: 1, padding: 14},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {color: Colors.white, fontSize: 11, fontWeight: '600'},
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: {fontSize: 11, fontWeight: '600'},
  title: {fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 3},
  author: {fontSize: 13, color: Colors.darkGray, marginBottom: 6},
  description: {fontSize: 13, color: Colors.darkGray, marginBottom: 8, lineHeight: 18},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  ownerRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  ownerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {fontSize: 10, fontWeight: 'bold', color: Colors.white},
  ownerText: {fontSize: 12, color: Colors.darkGray},
  dateText: {fontSize: 11, color: Colors.gray},
});

export default HomeScreen;
