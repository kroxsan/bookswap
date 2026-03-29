# 📚 BookSwap – Frontend

Kampüs İkinci El Kitap Takas Platformu · React Native (TypeScript)

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Android native bağımlılıklar
cd android && ./gradlew clean && cd ..

# 3. Metro başlat (ayrı terminal)
npm start

# 4. Android emülatöre gönder (ayrı terminal)
npm run android
```

## Klasör Yapısı

```
src/
├── screens/        # Ekran bileşenleri
├── navigation/     # React Navigation yapılandırması
├── services/       # API servisleri (Axios)
├── types/          # TypeScript tip tanımlamaları
├── components/     # Yeniden kullanılabilir UI bileşenleri
├── hooks/          # Custom React hooks
└── utils/          # Yardımcı fonksiyonlar ve sabitler
```

## Backend

API Base URL (Android emülatör): `http://10.0.2.2:5000/api`

## İlerleme

[PROGRESS.md](./PROGRESS.md)
