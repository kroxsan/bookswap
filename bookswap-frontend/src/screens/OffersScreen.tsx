import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {offerService, Offer} from '../services/api';
import Colors from '../theme/colors';

type Tab = 'incoming' | 'outgoing';

const statusColor = (status: string) => {
  if (status === 'Kabul Edildi') return Colors.success;
  if (status === 'Reddedildi') return Colors.error;
  return Colors.accent;
};

const statusIcon = (status: string) => {
  if (status === 'Kabul Edildi') return '✅';
  if (status === 'Reddedildi') return '❌';
  return '⏳';
};

const OffersScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [incoming, setIncoming] = useState<Offer[]>([]);
  const [outgoing, setOutgoing] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async () => {
    const [incResult, outResult] = await Promise.all([
      offerService.getIncoming(),
      offerService.getOutgoing(),
    ]);
    if (incResult.data) setIncoming(incResult.data);
    if (outResult.data) setOutgoing(outResult.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOffers();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handleAccept = (offer: Offer) => {
    Alert.alert(
      'Teklifi Kabul Et',
      `"${offer.offeredBookTitle}" teklifini kabul etmek istiyor musun?`,
      [
        {text: 'Vazgeç', style: 'cancel'},
        {
          text: 'Kabul Et',
          onPress: async () => {
            const result = await offerService.accept(offer.id);
            if (result.error) {
              Alert.alert('Hata', result.error);
            } else {
              setIncoming(prev =>
                prev.map(o => o.id === offer.id ? {...o, status: 'Kabul Edildi'} : o),
              );
            }
          },
        },
      ],
    );
  };

  const handleReject = (offer: Offer) => {
    Alert.alert(
      'Teklifi Reddet',
      `"${offer.offeredBookTitle}" teklifini reddetmek istiyor musun?`,
      [
        {text: 'Vazgeç', style: 'cancel'},
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            const result = await offerService.reject(offer.id);
            if (result.error) {
              Alert.alert('Hata', result.error);
            } else {
              setIncoming(prev =>
                prev.map(o => o.id === offer.id ? {...o, status: 'Reddedildi'} : o),
              );
            }
          },
        },
      ],
    );
  };

  const renderIncoming = ({item}: {item: Offer}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          📚 {item.requestedBookTitle}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: statusColor(item.status)}]}>
          <Text style={styles.statusText}>{statusIcon(item.status)} {item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardSub}>
        <Text style={styles.label}>Teklif eden: </Text>{item.senderName}
      </Text>
      <Text style={styles.cardSub}>
        <Text style={styles.label}>Teklif ettiği kitap: </Text>{item.offeredBookTitle}
      </Text>

      {item.status === 'Bekliyor' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleAccept(item)}>
            <Text style={styles.actionBtnText}>✓ Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(item)}>
            <Text style={styles.actionBtnText}>✕ Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderOutgoing = ({item}: {item: Offer}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          📚 {item.requestedBookTitle}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: statusColor(item.status)}]}>
          <Text style={styles.statusText}>{statusIcon(item.status)} {item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardSub}>
        <Text style={styles.label}>İlan sahibi: </Text>{item.receiverName}
      </Text>
      <Text style={styles.cardSub}>
        <Text style={styles.label}>Teklif ettiğin kitap: </Text>{item.offeredBookTitle}
      </Text>
    </View>
  );

  const data = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teklifler</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}
          onPress={() => setActiveTab('incoming')}>
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
            Gelen {incoming.length > 0 ? `(${incoming.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}
          onPress={() => setActiveTab('outgoing')}>
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
            Gönderilen {outgoing.length > 0 ? `(${outgoing.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>{activeTab === 'incoming' ? '📭' : '📤'}</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'incoming' ? 'Henüz gelen teklif yok.' : 'Henüz teklif göndermedin.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={activeTab === 'incoming' ? renderIncoming : renderOutgoing}
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
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabActive: {borderBottomWidth: 2, borderBottomColor: Colors.accent},
  tabText: {fontSize: 14, color: Colors.darkGray, fontWeight: '500'},
  tabTextActive: {color: Colors.accent, fontWeight: 'bold'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {fontSize: 16, color: Colors.darkGray},
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {color: Colors.white, fontSize: 11, fontWeight: '600'},
  cardSub: {fontSize: 13, color: Colors.darkGray, marginBottom: 3},
  label: {fontWeight: '600', color: Colors.primary},
  actionRow: {flexDirection: 'row', gap: 10, marginTop: 12},
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtn: {backgroundColor: Colors.success},
  rejectBtn: {backgroundColor: Colors.error},
  actionBtnText: {color: Colors.white, fontWeight: 'bold', fontSize: 13},
});

export default OffersScreen;
