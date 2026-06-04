// BookSwap - ReviewModal — Hafta 8
// Kabul edilmiş teklif kartındaki "Puan Ver" butonuna basınca açılan modal.
// 1-5 arası yıldız seçimi + isteğe bağlı yorum metni.

import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {reviewService} from '../services/api';
import Colors from '../theme/colors';

interface Props {
  visible: boolean;
  offerId: number;
  reviewedUserId: number;
  reviewedUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal = ({
  visible,
  offerId,
  reviewedUserId,
  reviewedUserName,
  onClose,
  onSuccess,
}: Props) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir puan seç.');
      return;
    }

    setSaving(true);
    const result = await reviewService.create(
      offerId,
      reviewedUserId,
      rating,
      comment.trim() || undefined,
    );
    setSaving(false);

    if (result.error) {
      Alert.alert('Hata', result.error);
      return;
    }

    Alert.alert('Teşekkürler! ⭐', 'Değerlendirmen kaydedildi.', [
      {text: 'Tamam', onPress: onSuccess},
    ]);
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Başlık */}
          <View style={styles.header}>
            <Text style={styles.title}>Değerlendirme Yap</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            <Text style={styles.userName}>{reviewedUserName}</Text> ile yaptığın takas nasıldı?
          </Text>

          {/* Yıldız seçici */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
                activeOpacity={0.7}>
                <Text style={[styles.star, star <= rating && styles.starFilled]}>
                  {star <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Puan etiketi */}
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Çok Kötü 😞', 'Kötü 😕', 'Orta 😐', 'İyi 😊', 'Mükemmel 🌟'][rating]}
            </Text>
          )}

          {/* Yorum alanı */}
          <Text style={styles.label}>Yorum (isteğe bağlı)</Text>
          <TextInput
            style={styles.input}
            placeholder="Takas deneyimini anlat..."
            placeholderTextColor={Colors.placeholder}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>

          {/* Gönder butonu */}
          <TouchableOpacity
            style={[styles.submitBtn, (saving || rating === 0) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={saving || rating === 0}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>⭐ Değerlendirmeyi Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  closeBtn: {padding: 4},
  closeBtnText: {fontSize: 18, color: Colors.darkGray},
  subtitle: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  userName: {fontWeight: 'bold', color: Colors.primary},
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  starBtn: {padding: 4},
  star: {fontSize: 40, color: Colors.inputBorder},
  starFilled: {color: '#F39C12'},
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {opacity: 0.45},
  submitBtnText: {color: Colors.white, fontSize: 15, fontWeight: 'bold'},
});

export default ReviewModal;
