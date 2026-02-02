# MiniZalo Frontend

Ứng dụng chat MiniZalo được xây dựng với **Expo SDK 50** và **Unified Codebase Strategy**.

## 🏗️ Kiến trúc Dự án

### Unified Codebase Strategy
- **Logic Layer (Shared 100%)**: `src/shared/` - Hooks, Services, Store được chia sẻ giữa Web và Mobile
- **View Layer (Platform-Specific)**: 
  - `src/views/web/` - UI components sử dụng `zmp-ui` cho Web
  - `src/views/mobile/` - UI components sử dụng NativeWind cho Mobile
- **Controller Layer**: `app/` - Expo Router với View Splitter Pattern

## 📦 Tech Stack

- **Framework**: Expo SDK 50 (Managed Workflow)
- **Router**: Expo Router (File-based routing)
- **Language**: TypeScript
- **Styling**: 
  - NativeWind v4 (TailwindCSS) cho Global CSS
  - `zmp-ui` cho Web UI Components
- **State Management**: Zustand
- **Networking**: Axios + TanStack Query

## 🚀 Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy trên Web
npm run web

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios
```

## 📁 Cấu trúc Thư mục

```
MiniZalo_Frontend/
├── app/                        # Expo Router (Controller)
│   ├── (auth)/
│   │   └── login.tsx           # View Splitter
│   ├── (tabs)/
│   │   └── index.tsx
│   └── _layout.tsx             # Root layout
├── src/
│   ├── views/                  # Platform-Specific Views
│   │   ├── web/                # ⚠️ ONLY import zmp-ui here
│   │   │   ├── auth/
│   │   │   │   └── LoginWeb.tsx
│   │   │   └── components/
│   │   └── mobile/             # ⚠️ NativeWind/RN Views
│   │       ├── auth/
│   │       │   └── LoginMobile.tsx
│   │       └── components/
│   └── shared/                 # Shared Logic (100%)
│       ├── components/         # Cross-platform wrappers
│       │   └── ZaloButton.tsx
│       ├── hooks/
│       ├── services/
│       ├── store/
│       └── styles/
│           └── global.css
├── tailwind.config.js
├── metro.config.js
└── tsconfig.json
```

## 🎨 Design System

### Màu sắc Zalo
- **Primary Blue**: `#0068FF` (`zalo-blue-primary`)
- **Secondary Blue**: `#0054CC` (`zalo-blue-secondary`)
- **Background**: `#F2F4F7` (`zalo-background`)

### View Splitter Pattern
File `app/(auth)/login.tsx` sử dụng `Platform.select()` để tự động render:
- `LoginWeb.tsx` khi chạy trên Web
- `LoginMobile.tsx` khi chạy trên Mobile

## 👥 Hướng dẫn cho Team

### Web Team
- Làm việc trong `src/views/web/`
- Sử dụng `zmp-ui` components
- Import CSS: `import "zmp-ui/zaui.css"`

### Mobile Team
- Làm việc trong `src/views/mobile/`
- Sử dụng React Native components
- Styling với NativeWind (className)

### Shared Logic
- Cả 2 team chia sẻ code trong `src/shared/`
- Hooks, Services, Store phải platform-agnostic
- Cross-platform components như `ZaloButton.tsx`

## 📝 Lưu ý quan trọng

1. **NativeWind v4**: Đã cấu hình `metro.config.js` để xử lý CSS
2. **zmp-ui**: Chỉ import trong `src/views/web/`
3. **TypeScript**: Đã cấu hình types cho NativeWind
4. **Expo Router**: Đã bật plugins trong `app.json`

## 🔧 Cấu hình đã hoàn thành

- ✅ Expo SDK 50 với Expo Router
- ✅ NativeWind v4 + TailwindCSS
- ✅ Metro Config cho CSS processing
- ✅ TypeScript configuration
- ✅ zmp-ui cho Web
- ✅ Zustand + Axios + TanStack Query
- ✅ Cấu trúc thư mục Unified Codebase
- ✅ View Splitter Pattern
- ✅ Proof of Concept: Login screens (Web & Mobile)

## 🚀 CI/CD & Deployment

### GitHub Actions (Automated CI)

Mỗi khi push hoặc tạo Pull Request vào `main` branch, GitHub Actions sẽ tự động:
1. ✅ Chạy TypeScript type checking (`npx tsc --noEmit`)
2. ✅ Chạy linting (`npm run lint`)
3. ✅ Build web để verify (`npx expo export -p web`)

**Trigger thủ công:**
1. Vào tab **Actions** trên GitHub repository
2. Chọn workflow **Frontend CI**
3. Click **Run workflow** → chọn branch → **Run workflow**

### Mobile Builds với EAS (Expo Application Services)

#### Prerequisites
```bash
# Cài đặt EAS CLI globally
npm install -g eas-cli

# Login vào Expo account
eas login
```

#### Build Android APK (Preview)
```bash
# Build trên cloud (khuyến nghị)
eas build -p android --profile preview

# Build local (nếu muốn test trên máy)
eas build -p android --profile preview --local
```

#### Build iOS Simulator
```bash
eas build -p ios --profile preview
```

#### Build Production (cho Store)
```bash
# Android (AAB for Google Play)
eas build -p android --profile production

# iOS (cho App Store)
eas build -p ios --profile production
```

### EAS Profiles

File `eas.json` đã được cấu hình với 2 profiles:

- **preview**: Internal distribution, APK cho Android (dễ cài đặt trực tiếp), simulator build cho iOS
- **production**: Store distribution, AAB cho Google Play, production build cho App Store

### Download & Install APK

Sau khi build xong, EAS sẽ cung cấp link download APK. Bạn có thể:
1. Download APK về máy/thiết bị Android
2. Enable "Install from unknown sources" trong Settings
3. Cài đặt APK trực tiếp

Hoặc quét QR code từ Expo Go app để test ngay.
