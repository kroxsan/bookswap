// BookSwap - OffersScreen
// Hafta 8: Kabul edilmiş teklif kartlarına "Puan Ver" butonu eklendi.
// Kullanıcı daha önce puan verdiyse buton görünmez.

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
import {offerService, reviewService, Offer, getUserId} from '../services/api';
import ReviewModal from './ReviewModal';
import Colors from '../theme/colors';

type Tab = 'incoming' | 'outgoing';

const STATUS_CONFIG: Record<string, {label: string; color: string; bg: string}> = {
  Bekliyor: {label: 'Bekliyor', color: '#F39C12', bg: '#FEF9E7'},
  Kabul:    {label: 'Kabul ✓',  color: '#27AE60', bg: '#EAFAF1'},
  Red:      {label: 'Reddedildi', color: '#E74C3C', bg: '#FDEDEC'},
};

const OffersScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [incoming, setIncoming] = useState<Offer[]>([]);
  const [outgoing, setOutgoing] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Hangi tekliflerde "Puan Ver" butonu gösterilecek
  const [reviewable, setReviewable] = useState<Record<number, {canReview: boolean; targetUserId?: number}>>({});

  // ReviewModal state
  const [reviewModal, setReviewModal] = useState<{
    visible: boolean;
    offerId: number;
    targetUserId: number;
    targetUserName: string;
  }>({visible: false, offerId: 0, targetUserId: 0, targetUserName: ''});

  const fetchAll = async () => {
    const [inRes, outRes] = await Promise.all([
      offerService.getIncoming(),
      offerService.getOutgoing(),
    ]);
    const inOffers  = inRes.data  ?? [];
    const outOffers = outRes.data ?? [];
    setIncoming(inOffers);
    setOutgoing(outOffers);

    // Kabul edilmiş teklifler için puan verilebilir mi kontrol et
    const acceptedOffers = [...inOffers, ...outOffers].filter(o => o.status === 'Kabul');
    const reviewChecks = await Promise.all(
      acceptedOffers.map(o => reviewService.canReview(o.id).then(r => ({id: o.id, result: r.data})))
    );
    const map: Record<number, {canReview: boolean; targetUserId?: number}> = {};
    reviewChecks.forEach(({id, result}) => {
      if (result) map[id] = result;
    });
    setReviewable(map);

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAll();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleAccept = (offer: Offer) => {
    Alert.alert(
      'Teklifi Kabul Et',
      `"${offer.offeredBookTitle}" karşılığında "${offer.targetBookTitle}" takası yapılsın mı?`,
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Kabul Et',
          onPress: async () => {
            setActionLoading(offer.id);
            const result = await offerService.accept(offer.id);
            setActionLoading(null);
            if (result.error) { Alert.alert('Hata', result.error); return; }
            setIncoming(prev => prev.map(o => o.id === offer.id ? {...o, status: 'Kabul'} : o));
            // Puan verilebilir mi kontrol et
            const canRes = await reviewService.canReview(offer.id);
            if (canRes.data) {
              setReviewable(prev => ({...prev, [offer.id]: canRes.data!}));
            }
          },
        },
      ],
    );
  };

  const handleReject = (offer: Offer) => {
    Alert.alert('Teklifi Reddet', 'Bu teklifi reddetmek istediğine emin misin?', [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Reddet',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(offer.id);
          const result = await offerService.reject(offer.id);
          setActionLoading(null);
          if (result.error) { Alert.alert('Hata', result.error); return; }
          setIncoming(prev => prev.map(o => o.id === offer.id ? {...o, status: 'Red'} : o));
        },
      },
    ]);
  };

  const openReviewModal = (offer: Offer) => {
    const info = reviewable[offer.id];
    if (!info?.canReview || !info.targetUserId) return;

    const isOutgoing = offer.senderId === getUserId();
    const targetName = isOutgoing ? offer.receiverName : offer.senderName;

    setReviewModal({
      visible: true,
      offerId: offer.id,
      targetUserId: info.targetUserId,
      targetUserName: targetName,
    });
  };

  const handleReviewSuccess = () => {
    setReviewModal(prev => ({...prev, visible: false}));
    setReviewable(prev => ({
      ...prev,
      [reviewModal.offerId]: {canReview: false},
    }));
  };

  const renderOfferCard = (item: Offer, isIncoming: boolean) => {
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Bekliyor;
    const isActionLoading = actionLoading === item.id;
    const reviewInfo = reviewable[item.id];

    return (
      <View style={styles.card} key={item.id}>
        <View style={[styles.statusBadge, {backgroundColor: statusCfg.bg}]}>
          <Text style={[styles.statusText, {color: statusCfg.color}]}>{statusCfg.label}</Text>
        </View>

        <View style={styles.swapRow}>
          <View style={styles.swapBook}>
            <Text style={styles.swapLabel}>{isIncoming ? 'Teklif Edilen' : 'Teklif Ettiğim'}</Text>
            <Text style={styles.swapTitle} numberOfLines={2}>{item.offeredBookTitle}</Text>
            <Text style={styles.swapAuthor}>{item.offeredBookAuthor}</Text>
          </View>
          <Text style={styles.swapArrow}>⇄</Text>
          <View style={styles.swapBook}>
            <Text style={styles.swapLabel}>{isIncoming ? 'İstediği Kitap' : 'İstediğim Kitap'}</Text>
            <Text style={styles.swapTitle} numberOfLines={2}>{item.targetBookTitle}</Text>
            <Text style={styles.swapAuthor}>{item.targetBookAuthor}</Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {isIncoming ? `👤 ${item.senderName}` : `📬 ${item.receiverName}`}
          </Text>
          <Text style={styles.metaDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        {/* Bekliyor → kabul / red butonları (sadece gelen tekliflerde) */}
        {isIncoming && item.status === 'Bekliyor' && (
          <View style={styles.actionRow}>
            {isActionLoading ? (
              <ActivityIndicator color={Colors.accent} style={{marginTop: 8}} />
            ) : (
              <>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
                  <Text style={styles.rejectBtnText}>✕ Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
                  <Text style={styles.acceptBtnText}>✓ Kabul Et</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Hafta 8: Kabul edilmiş ve henüz puan verilmemişse "Puan Ver" butonu */}
        {item.status === 'Kabul' && reviewInfo?.canReview && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => openReviewModal(item)}
            activeOpacity={0.85}>
            <Text style={styles.reviewBtnText}>⭐ Puan Ver</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const data = activeTab === 'incoming' ? incoming : outgoing;
  const isEmpty = !loading && data.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔄 Tekliflerim</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}
          onPress={() => setActiveTab('incoming')}>
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
            Gelen ({incoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}
          onPress={() => setActiveTab('outgoing')}>
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
            Giden ({outgoing.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : isEmpty ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {activeTab === 'incoming' ? 'Henüz gelen teklif yok.' : 'Henüz gönderdiğin teklif yok.'}
          </Text>
          <Text style={styles.emptySubText}>
            {activeTab === 'incoming'
              ? 'Biri sana teklif gönderdiğinde burada görünecek.'
              : 'Ana sayfadan bir kitaba teklif gönderebilirsin.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => renderOfferCard(item, activeTab === 'incoming')}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} />
          }
        />
      )}

      {/* Puan verme modalı */}
      <ReviewModal
        visible={reviewModal.visible}
        offerId={reviewModal.offerId}
        reviewedUserId={reviewModal.targetUserId}
        reviewedUserName={reviewModal.targetUserName}
        onClose={() => setReviewModal(prev => ({...prev, visible: false}))}
        onSuccess={handleReviewSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  header: {backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16},
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  tabRow: {flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.inputBorder},
  tab: {flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent'},
  tabActive: {borderBottomColor: Colors.accent},
  tabText: {fontSize: 14, fontWeight: '600', color: Colors.gray},
  tabTextActive: {color: Colors.accent},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyText: {fontSize: 16, fontWeight: 'bold', color: Colors.darkGray, marginBottom: 8},
  emptySubText: {fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22},
  list: {padding: 16, gap: 12},
  card: {backgroundColor: Colors.white, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 4},
  statusBadge: {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12},
  statusText: {fontSize: 12, fontWeight: '700'},
  swapRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8},
  swapBook: {flex: 1},
  swapLabel: {fontSize: 10, color: Colors.gray, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4},
  swapTitle: {fontSize: 13, fontWeight: 'bold', color: Colors.primary, marginBottom: 2},
  swapAuthor: {fontSize: 11, color: Colors.darkGray},
  swapArrow: {fontSize: 22, color: Colors.accent, paddingHorizontal: 4},
  cardMeta: {flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.inputBorder, paddingTop: 10},
  metaText: {fontSize: 12, color: Colors.darkGray},
  metaDate: {fontSize: 12, color: Colors.gray},
  actionRow: {flexDirection: 'row', gap: 10, marginTop: 12},
  rejectBtn: {flex: 1, borderWidth: 1.5, borderColor: Colors.error, borderRadius: 10, paddingVertical: 10, alignItems: 'center'},
  rejectBtnText: {color: Colors.error, fontWeight: '700', fontSize: 14},
  acceptBtn: {flex: 1, backgroundColor: Colors.success, borderRadius: 10, paddingVertical: 10, alignItems: 'center'},
  acceptBtnText: {color: Colors.white, fontWeight: '700', fontSize: 14},
  reviewBtn: {
    marginTop: 12,
    backgroundColor: '#FEF9E7',
    borderWidth: 1.5,
    borderColor: '#F39C12',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reviewBtnText: {color: '#F39C12', fontWeight: '700', fontSize: 14},
});

export default OffersScreen;
