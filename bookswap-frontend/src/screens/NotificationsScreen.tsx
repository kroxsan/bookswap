
// Hafta 7: Bildirimler ekranı
// - Tüm bildirimleri listeler (okunmuş/okunmamış ayrımıyla)
// - Bir bildirimi tıklayınca okundu işaretler
// - "Tümünü Okundu İşaretle" butonu

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {notificationService, Notification} from '../services/api';
import Colors from '../theme/colors';

const TYPE_CONFIG: Record<string, {icon: string; color: string}> = {
  TeklifAlindi: {icon: '🔄', color: '#2980B9'},
  TeklifKabul:  {icon: '✅', color: '#27AE60'},
  TeklifRed:    {icon: '❌', color: '#E74C3C'},
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    const result = await notificationService.getAll();
    if (result.data) setNotifications(result.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications(); //Ekrana her geçişte fetchNotifications çalışıyor
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkRead = async (item: Notification) => {
    if (item.isRead) return;

    // Yerel state'i hemen güncelle — UX hızlanır
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? {...n, isRead: true} : n)),
    );

    await notificationService.markRead(item.id);
  };

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) {
      Alert.alert('Bilgi', 'Okunmamış bildirim yok.');
      return;
    }

    setMarkingAll(true);
    const result = await notificationService.markAllRead();
    setMarkingAll(false);

    if (result.error) {
      Alert.alert('Hata', result.error);
      return;
    }

    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderItem = ({item}: {item: Notification}) => {
    const cfg = TYPE_CONFIG[item.type] ?? {icon: '🔔', color: Colors.darkGray};

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        activeOpacity={0.75}
        onPress={() => handleMarkRead(item)}>
        {/* Sol — tip ikonu */}
        <View style={[styles.iconBox, {backgroundColor: cfg.color + '20'}]}>
          <Text style={styles.iconText}>{cfg.icon}</Text>
        </View>

        {/* Orta — içerik */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔔 Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} okunmamış bildirim</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markingAll}>
            {markingAll ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.markAllText}>Tümünü Oku</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Henüz bildirim yok.</Text>
          <Text style={styles.emptySubText}>
            Birileri sana teklif gönderdiğinde{'\n'}veya teklifin yanıtlandığında burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  headerSub: {fontSize: 12, color: Colors.gray, marginTop: 2},
  markAllBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {color: Colors.accent, fontSize: 13, fontWeight: '600'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyText: {fontSize: 17, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 8},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22},
  list: {padding: 16, gap: 10},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  cardUnread: {
    borderLeftColor: Colors.accent,
    backgroundColor: '#FFFAF6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {fontSize: 20},
  content: {flex: 1},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {fontSize: 14, fontWeight: '600', color: Colors.darkGray, flex: 1},
  titleUnread: {color: Colors.primary, fontWeight: 'bold'},
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginLeft: 6,
  },
  message: {fontSize: 13, color: Colors.darkGray, lineHeight: 19, marginBottom: 6},
  time: {fontSize: 11, color: Colors.gray},
});

export default NotificationsScreen;
