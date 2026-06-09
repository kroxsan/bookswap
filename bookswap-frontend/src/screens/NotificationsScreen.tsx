// BookSwap - NotificationsScreen
// Hafta 10: Kart padding iyileştirmesi, ikon kutucuğu büyütüldü, boş ekran görseli güncellendi

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
  TeklifKabul:  {icon: '✅', color: '#1DB954'},
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

  useFocusEffect(useCallback(() => { setLoading(true); fetchNotifications(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const handleMarkRead = async (item: Notification) => {
    if (item.isRead) return;
    setNotifications(prev => prev.map(n => (n.id === item.id ? {...n, isRead: true} : n)));
    await notificationService.markRead(item.id);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead).length;
    if (unread === 0) { Alert.alert('Bilgi', 'Okunmamış bildirim yok.'); return; }
    setMarkingAll(true);
    const result = await notificationService.markAllRead();
    setMarkingAll(false);
    if (result.error) { Alert.alert('Hata', result.error); return; }
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} saat önce`;
    const diffDay = Math.floor(diffHour / 24);
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
        {/* Hafta 10: ikon kutusu biraz büyütüldü */}
        <View style={[styles.iconBox, {backgroundColor: cfg.color + '22'}]}>
          <Text style={styles.iconText}>{cfg.icon}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔔 Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} okunmamış</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead} disabled={markingAll}>
            {markingAll
              ? <ActivityIndicator size="small" color={Colors.accent} />
              : <Text style={styles.markAllText}>Tümünü Oku</Text>}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔕</Text>
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  headerSub: {fontSize: 12, color: Colors.gray, marginTop: 2},
  markAllBtn: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {color: Colors.accent, fontSize: 13, fontWeight: '600'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyIcon: {fontSize: 52, marginBottom: 14},
  emptyText: {fontSize: 17, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 8},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22},
  list: {padding: 16, gap: 10},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  cardUnread: {
    borderLeftColor: Colors.accent,
    backgroundColor: '#FFFAF6',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {fontSize: 22},
  content: {flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4},
  notifTitle: {fontSize: 14, fontWeight: '600', color: Colors.darkGray, flex: 1},
  titleUnread: {color: Colors.primary, fontWeight: 'bold'},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginLeft: 6},
  message: {fontSize: 13, color: Colors.darkGray, lineHeight: 19, marginBottom: 5},
  time: {fontSize: 11, color: Colors.gray},
});

export default NotificationsScreen;
