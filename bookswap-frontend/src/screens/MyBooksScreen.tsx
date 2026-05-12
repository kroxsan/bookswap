

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {bookService, Book, CreateBookData} from '../services/api';
import Colors from '../theme/colors';

const CATEGORIES = ['Roman', 'Ders Kitabı', 'Bilim', 'Tarih', 'Kişisel Gelişim', 'Diğer'];
const CONDITIONS = ['Yeni', 'İyi', 'Orta', 'Yıpranmış'];

const MyBooksScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');

  const fetchMyBooks = async () => {
    const result = await bookService.getMy();
    if (result.data) setBooks(result.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyBooks();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyBooks();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCategory('');
    setCondition('');
    setDescription('');
  };

  const handleAdd = async () => {
    if (!title.trim() || !author.trim() || !category || !condition) {
      Alert.alert('Hata', 'Başlık, yazar, kategori ve durum zorunludur.');
      return;
    }

    setSaving(true);
    const data: CreateBookData = {
      title: title.trim(),
      author: author.trim(),
      category,
      condition,
      description: description.trim() || undefined,
    };

    const result = await bookService.create(data); //api'ye post
    setSaving(false);

    if (result.error) {
      Alert.alert('Hata', result.error);
      return;
    }

    setBooks(prev => [result.data!, ...prev]);
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (book: Book) => {
    Alert.alert(
      'İlanı Sil',
      `"${book.title}" ilanını silmek istediğine emin misin?`,
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const result = await bookService.delete(book.id); //api'ye delete 
            if (result.error) {
              Alert.alert('Hata', result.error);
            } else {
              setBooks(prev => prev.filter(b => b.id !== book.id));
            }
          },
        },
      ],
    );
  };

  const renderBook = ({item}: {item: Book}) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.tags}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
            <View style={[styles.badge, styles.conditionBadge]}>
              <Text style={styles.badgeText}>{item.condition}</Text>
            </View>
            <View style={[styles.badge, item.status === 'Aktif' ? styles.activeBadge : styles.swappedBadge]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlanlarım</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ İlan Ekle</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : books.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Henüz ilanın yok.</Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyAddBtnText}>İlk İlanını Ekle</Text>
          </TouchableOpacity>
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

      {/* İlan Ekleme Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni İlan Ekle</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Kitap Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Kitabın adı"
                placeholderTextColor={Colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Yazar *</Text>
              <TextInput
                style={styles.input}
                placeholder="Yazarın adı"
                placeholderTextColor={Colors.placeholder}
                value={author}
                onChangeText={setAuthor}
              />

              <Text style={styles.label}>Kategori *</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipSelected]}
                    onPress={() => setCategory(cat)}>
                    <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Kitap Durumu *</Text>
              <View style={styles.chipRow}>
                {CONDITIONS.map(cond => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.chip, condition === cond && styles.chipSelected]}
                    onPress={() => setCondition(cond)}>
                    <Text style={[styles.chipText, condition === cond && styles.chipTextSelected]}>
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Açıklama (isteğe bağlı)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Kitap hakkında kısa bir açıklama..."
                placeholderTextColor={Colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleAdd}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>İlanı Yayınla</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {color: Colors.white, fontWeight: 'bold', fontSize: 13},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyText: {fontSize: 16, color: Colors.darkGray, marginBottom: 16},
  emptyAddBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyAddBtnText: {color: Colors.white, fontWeight: 'bold'},
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
  cardTop: {flexDirection: 'row', alignItems: 'flex-start'},
  cardInfo: {flex: 1},
  title: {fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginBottom: 3},
  author: {fontSize: 13, color: Colors.darkGray, marginBottom: 8},
  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionBadge: {backgroundColor: Colors.darkGray},
  activeBadge: {backgroundColor: Colors.success},
  swappedBadge: {backgroundColor: Colors.gray},
  badgeText: {color: Colors.white, fontSize: 11, fontWeight: '600'},
  deleteBtn: {padding: 6, marginLeft: 8},
  deleteText: {fontSize: 20},
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', color: Colors.primary},
  closeBtn: {fontSize: 18, color: Colors.darkGray, padding: 4},
  label: {fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 6, marginTop: 12},
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.primary,
  },
  textArea: {height: 80, textAlignVertical: 'top'},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.inputBg,
  },
  chipSelected: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  chipText: {fontSize: 13, color: Colors.darkGray},
  chipTextSelected: {color: Colors.white, fontWeight: '600'},
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  btnDisabled: {opacity: 0.7},
  saveBtnText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
});

export default MyBooksScreen;
