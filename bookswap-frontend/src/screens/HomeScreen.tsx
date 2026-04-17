import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {bookService, Book} from '../services/api';
import Colors from '../theme/colors';

const HomeScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = async () => {
    const result = await bookService.getAll();
    if (result.data) setBooks(result.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBooks();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const renderBook = ({item}: {item: Book}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, item.status === 'Aktif' ? styles.activeBadge : styles.swappedBadge]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.author}>{item.author}</Text>
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <View style={[styles.tag, styles.conditionTag]}>
          <Text style={styles.tagText}>{item.condition}</Text>
        </View>
      </View>
      {item.userName && (
        <Text style={styles.owner}>👤 {item.userName}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.headerTitle}>BookSwap</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : books.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Henüz ilan yok.</Text>
          <Text style={styles.emptySubText}>İlanlarım sekmesinden ilk ilanını ekle!</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {fontSize: 24},
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 6},
  emptySubText: {fontSize: 14, color: Colors.darkGray, textAlign: 'center'},
  list: {padding: 16, gap: 10},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  author: {fontSize: 13, color: Colors.darkGray, marginBottom: 8},
  tags: {flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8},
  tag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionTag: {backgroundColor: Colors.darkGray},
  tagText: {color: Colors.white, fontSize: 11, fontWeight: '600'},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadge: {backgroundColor: Colors.success},
  swappedBadge: {backgroundColor: Colors.gray},
  statusText: {color: Colors.white, fontSize: 11, fontWeight: '600'},
  owner: {fontSize: 12, color: Colors.darkGray},
});

export default HomeScreen;
