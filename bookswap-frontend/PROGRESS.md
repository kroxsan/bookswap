# BookSwap – İlerleme Notları

> Her hafta tamamlanan özellikler ve video linkleri bu dosyada tutulacaktır.

---

## Hafta 1 – Proje Kurulumu ✅

**Tarih:** Mart 2026

**Tamamlananlar:**
- [x] React Native 0.76 + TypeScript projesi oluşturuldu
- [x] Klasör yapısı belirlendi (`src/screens`, `components`, `navigation`, `services`, `types`, `hooks`, `utils`, `assets`)
- [x] Path alias'ları tanımlandı (`@screens/*`, `@services/*` vb.)
- [x] `App.tsx` temel yapısı yazıldı
- [x] Navigation altyapısı kuruldu (`RootNavigator`, `AuthNavigator`, `MainNavigator`)
- [x] TypeScript tipleri tanımlandı (`User`, `Book`, `Offer`, `Review`, `Notification` + nav parametreleri)
- [x] Axios API servisi yapılandırıldı (interceptors ile)
- [x] Tüm ekranların iskelet bileşenleri oluşturuldu
- [x] Renk paleti ve utility dosyaları hazırlandı

**Proje Yapısı:**
```
bookswap-frontend/
├── src/
│   ├── screens/
│   │   ├── Auth/          → LoginScreen, RegisterScreen
│   │   ├── Home/          → HomeScreen
│   │   ├── Listings/      → MyListingsScreen
│   │   ├── Offers/        → OffersScreen
│   │   ├── Notifications/ → NotificationsScreen
│   │   └── Profile/       → ProfileScreen
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/
│   │   ├── api.ts          (Axios instance + interceptors)
│   │   └── authService.ts
│   ├── types/index.ts
│   ├── utils/colors.ts
│   ├── components/         (ilerleyen haftalarda)
│   └── hooks/              (ilerleyen haftalarda)
├── App.tsx
├── index.js
└── package.json
```

**Video:** <!-- Link buraya eklenecek -->

---

## Hafta 2 – Planlanan

- ASP.NET Core backend kurulumu
- MSSQL tablo tasarımları ve bağlantısı
- Kullanıcı kayıt ve giriş endpoint'leri (JWT)

---

## Hafta 3 – Planlanan

- Login ve Kayıt ekranlarının tam UI'ı
- Auth context ve state yönetimi
- Navigation guard (token kontrolü ile)
