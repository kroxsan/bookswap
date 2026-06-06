// BookSwap - ProfileScreen
// Hafta 8: Kullanıcının ortalama puanı ve aldığı yorumlar gösteriliyor
// Hafta 9: Tamamlanan takas sayısı (SwapCount) gösteriliyor

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {clearToken, reviewService, UserRating, getUserId} from '../services/api';
import Colors from '../theme/colors';

const ProfileScreen = ({navigation, route}: any) => {
  const userName: string  = route?.params?.userName  ?? 'Kullanıcı';
  const userId: number    = route?.params?.userId    ?? getUserId() ?? 0;
  const swapCount: number = route?.params?.swapCount ?? 0;
  const initial = userName.charAt(0).toUpperCase();

  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRating = async () => {
    if (!userId) { setLoading(false); return; }
    const result = await reviewService.getUserRating(userId);
    if (result.data) setUserRating(result.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRating();
    }, [userId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRating();
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkış yapmak istiyor musun?', [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => { clearToken(); navigation.replace('Login'); },
      },
    ]);
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={[styles.star, i <= Math.round(rating) && styles.starFilled]}>
        {i <= Math.round(rating) ? '★' : '☆'}
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} />
        }>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{userName}</Text>

          {loading ? (
            <ActivityIndicator color={Colors.accent} style={{marginTop: 8}} />
          ) : userRating && userRating.totalReviews > 0 ? (
            <View style={styles.ratingRow}>
              {renderStars(userRating.averageRating)}
              <Text style={styles.ratingAvg}>{userRating.averageRating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({userRating.totalReviews} değerlendirme)</Text>
            </View>
          ) : (
            <Text style={styles.noRating}>Henüz değerlendirme yok</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔄</Text>
            <Text style={styles.statValue}>{swapCount}</Text>
            <Text style={styles.statLabel}>Tamamlanan Takas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>
              {userRating && userRating.totalReviews > 0
                ? userRating.averageRating.toFixed(1)
                : '—'}
            </Text>
            <Text style={styles.statLabel}>Ortalama Puan</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Hafta 9</Text>
          <Text style={styles.infoText}>
            Takas akışı uçtan uca tamamlandı.{'\n'}
            Teklif kabul edildiğinde her iki kitap "Takaslandı"{'\n'}
            olarak işaretlenir ve takas sayısı güncellenir.
          </Text>
        </View>

        {userRating && userRating.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>
              Aldığım Değerlendirmeler ({userRating.totalReviews})
            </Text>

            {userRating.reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerAvatarText}>
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.lightGray},
  header: {backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16},
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
  content: {padding: 20, paddingBottom: 40},
  avatarContainer: {alignItems: 'center', marginBottom: 20},
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, elevation: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15, shadowRadius: 6,
  },
  avatarText: {fontSize: 32, fontWeight: 'bold', color: Colors.white},
  name: {fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 6},
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  star: {fontSize: 20, color: Colors.inputBorder},
  starFilled: {color: '#F39C12'},
  ratingAvg: {fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginLeft: 4},
  ratingCount: {fontSize: 13, color: Colors.darkGray},
  noRating: {fontSize: 13, color: Colors.gray, marginTop: 4},
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {fontSize: 26, marginBottom: 6},
  statValue: {fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 4},
  statLabel: {fontSize: 12, color: Colors.darkGray, textAlign: 'center'},
  infoBox: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    marginBottom: 20, borderLeftWidth: 4, borderLeftColor: Colors.accent, elevation: 1,
  },
  infoLabel: {fontSize: 13, fontWeight: 'bold', color: Colors.accent, marginBottom: 6},
  infoText: {fontSize: 14, color: Colors.darkGray, lineHeight: 22},
  reviewsSection: {marginBottom: 20},
  reviewsTitle: {fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginBottom: 12},
  reviewCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  reviewHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10},
  reviewerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewerAvatarText: {fontSize: 14, fontWeight: 'bold', color: Colors.white},
  reviewerInfo: {flex: 1},
  reviewerName: {fontSize: 14, fontWeight: 'bold', color: Colors.primary},
  reviewDate: {fontSize: 11, color: Colors.gray, marginTop: 1},
  reviewStars: {flexDirection: 'row', gap: 1},
  reviewComment: {
    fontSize: 13, color: Colors.darkGray, fontStyle: 'italic',
    lineHeight: 19, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: Colors.inputBorder,
  },
  logoutBtn: {backgroundColor: Colors.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
  logoutText: {color: Colors.white, fontWeight: 'bold', fontSize: 16},
});

export default ProfileScreen;
