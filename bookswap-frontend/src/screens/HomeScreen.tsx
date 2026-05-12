// BookSwap - HomeScreen
// Hafta 5: Arama, kategori filtresi + kitap detayına gitme

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
const CONDITIONS_MAP: Record<string, string> = {
  'Yeni': '🟢',
  'İyi': '🔵',
  'Orta': '🟡',
  'Yıpranmış': '🔴',
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
    if (result.error) {
      Alert.alert('Hata', result.error);
    } else {
      setBooks(result.data ?? []);
    }
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

  // Arama veya filtre değişince backend'e sorgu at
  const handleSearch = useCallback(async (text: string, category: string) => {
    // Her ikisi de boşsa tüm ilanları getir
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

    if (result.error) {
      Alert.alert('Hata', result.error);
    } else {
      setBooks(result.data ?? []);
    }
  }, []);

  const onSearchChange = (text: string) => {
    setSearchText(text);
    handleSearch(text, selectedCategory);
  };

  const onCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    handleSearch(searchText, cat);
  };

  const renderBook = ({item}: {item: Book}) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('BookDetail', {bookId: item.id})}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.conditionText}>
          {CONDITIONS_MAP[item.condition] ?? '⚪'} {item.condition}
        </Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.author}>{item.author}</Text>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.ownerText}>👤 {item.userName}</Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 BookSwap</Text>
        <Text style={styles.headerSub}>Aktif İlanlar</Text>
      </View>

      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kitap adı veya yazar ara..."
          placeholderTextColor={Colors.placeholder}
          value={searchText}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
        />
        {searching && (
          <ActivityIndicator
            style={styles.searchSpinner}
            size="small"
            color={Colors.accent}
          />
        )}
      </View>

      {/* Kategori Filtreleri */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => onCategorySelect(cat)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat && styles.filterChipTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : books.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {searchText || selectedCategory !== 'Tümü'
              ? 'Arama sonucu bulunamadı.'
              : 'Henüz ilan yok.'}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.accent]}
              tintColor={Colors.accent}
            />
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
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  headerSub: {fontSize: 13, color: Colors.gray, marginTop: 2},
  searchContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.primary,
  },
  searchSpinner: {marginLeft: 10},
  filterWrapper: {
    backgroundColor: Colors.primary,
    paddingBottom: 12,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {fontSize: 13, color: Colors.gray},
  filterChipTextActive: {color: Colors.white, fontWeight: '600'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyText: {fontSize: 16, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 8},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center'},
  list: {padding: 16, gap: 12},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
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
  conditionText: {fontSize: 12, color: Colors.darkGray},
  title: {fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 4},
  author: {fontSize: 13, color: Colors.darkGray, marginBottom: 6},
  description: {fontSize: 13, color: Colors.darkGray, marginBottom: 8, lineHeight: 18},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  ownerText: {fontSize: 12, color: Colors.darkGray},
  dateText: {fontSize: 12, color: Colors.gray},
});

export default HomeScreen;
