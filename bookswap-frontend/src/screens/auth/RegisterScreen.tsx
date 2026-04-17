import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import Colors from '../../theme/colors';
import {authService, setToken} from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      Alert.alert('Hata', 'Tüm alanlar doldurulmalıdır.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const result = await authService.register(name.trim(), email.trim(), password);
    setLoading(false);

    if (result.error) {
      Alert.alert('Kayıt Başarısız', result.error);
      return;
    }

    setToken(result.data!.token);
    navigation.replace('Main', {userName: result.data!.name});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.logo}>📚</Text>
            <Text style={styles.appName}>BookSwap</Text>
            <Text style={styles.tagline}>Yeni hesap oluştur</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kayıt Ol</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                placeholder="Adın ve soyadın"
                placeholderTextColor={Colors.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@universite.edu.tr"
                placeholderTextColor={Colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={Colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setPasswordVisible(v => !v)}>
                  <Text style={styles.eyeText}>{passwordVisible ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifreni tekrar gir"
                placeholderTextColor={Colors.placeholder}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.badge}>Hafta 4 ✅</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.primary},
  flex: {flex: 1},
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {alignItems: 'center', marginBottom: 28, paddingTop: 16},
  logo: {fontSize: 48, marginBottom: 6},
  appName: {fontSize: 28, fontWeight: 'bold', color: Colors.white, marginBottom: 4},
  tagline: {fontSize: 13, color: Colors.gray},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 20},
  inputGroup: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 6},
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.primary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
  },
  passwordInput: {flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.primary},
  eyeBtn: {paddingHorizontal: 12, paddingVertical: 12},
  eyeText: {fontSize: 18},
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {opacity: 0.7},
  btnText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
  linkRow: {flexDirection: 'row', justifyContent: 'center', marginBottom: 16},
  linkText: {color: Colors.gray, fontSize: 14},
  link: {color: Colors.accent, fontSize: 14, fontWeight: 'bold'},
  badge: {textAlign: 'center', color: Colors.darkGray, fontSize: 12},
});

export default RegisterScreen;
