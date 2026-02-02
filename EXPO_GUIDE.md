# 📖 Expo Development Guide - MiniZalo Frontend

## 🏗️ Quy định Cấu trúc Thư mục

### 📂 `app/` - Expo Router (Controller Layer)
**Mục đích**: File-based routing, navigation structure

**Quy tắc:**
- ✅ Chỉ chứa routing logic và View Splitter
- ✅ Không viết business logic ở đây
- ✅ Import views từ `src/views/`
- ❌ Không viết UI components trực tiếp

**Ví dụ:**
```typescript
// ✅ ĐÚNG - View Splitter Pattern
import { Platform } from "react-native";
const LoginWeb = require("@/views/web/auth/LoginWeb").default;
const LoginMobile = require("@/views/mobile/auth/LoginMobile").default;

export default Platform.select({
  web: LoginWeb,
  default: LoginMobile,
});

// ❌ SAI - Viết UI trực tiếp
export default function Login() {
  return <View><Text>Login</Text></View>; // ❌
}
```

---

### 📂 `src/views/web/` - Web UI Components
**Mục đích**: UI components cho Web platform, sử dụng `zmp-ui`

**Quy tắc:**
- ✅ Chỉ import `zmp-ui` components
- ✅ Import CSS: `import "zmp-ui/zaui.css"`
- ✅ Sử dụng HTML/DOM APIs
- ❌ KHÔNG import React Native components
- ❌ KHÔNG import `react-native` package

**Ví dụ:**
```typescript
// ✅ ĐÚNG
import { Page, Button, Input } from "zmp-ui";
import "zmp-ui/zaui.css";

// ❌ SAI
import { View, Text } from "react-native"; // ❌ Không dùng RN trong web
```

**Cấu trúc:**
```
src/views/web/
├── auth/
│   ├── LoginWeb.tsx
│   └── RegisterWeb.tsx
├── chat/
│   ├── ChatListWeb.tsx
│   └── ChatRoomWeb.tsx
└── components/
    ├── HeaderWeb.tsx
    └── SidebarWeb.tsx
```

---

### 📂 `src/views/mobile/` - Mobile UI Components
**Mục đích**: UI components cho Mobile (Android/iOS), sử dụng React Native + NativeWind

**Quy tắc:**
- ✅ Import React Native components (`View`, `Text`, `TouchableOpacity`, etc.)
- ✅ Styling với NativeWind (`className` prop)
- ✅ Sử dụng React Native APIs
- ❌ KHÔNG import `zmp-ui`
- ❌ KHÔNG sử dụng HTML tags (`<div>`, `<span>`)

**Ví dụ:**
```typescript
// ✅ ĐÚNG
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function LoginMobile() {
  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold">Login</Text>
    </View>
  );
}

// ❌ SAI
import { Button } from "zmp-ui"; // ❌ Không dùng zmp-ui trong mobile
```

**Cấu trúc:**
```
src/views/mobile/
├── auth/
│   ├── LoginMobile.tsx
│   └── RegisterMobile.tsx
├── chat/
│   ├── ChatListMobile.tsx
│   └── ChatRoomMobile.tsx
└── components/
    ├── HeaderMobile.tsx
    └── TabBarMobile.tsx
```

---

### 📂 `src/shared/` - Shared Logic (Platform-Agnostic)
**Mục đích**: Code được chia sẻ giữa Web và Mobile

**Quy tắc:**
- ✅ Phải hoạt động trên CẢ Web và Mobile
- ✅ Không phụ thuộc vào platform-specific libraries
- ✅ Sử dụng React hooks, pure functions
- ❌ KHÔNG import `zmp-ui` hoặc React Native specific APIs
- ❌ KHÔNG sử dụng `Platform.OS` (trừ wrapper components)

#### `src/shared/hooks/`
**Mục đích**: Custom React hooks

**Ví dụ:**
```typescript
// ✅ ĐÚNG - Platform-agnostic
export function useAuth() {
  const [user, setUser] = useState(null);
  // Logic không phụ thuộc platform
  return { user, login, logout };
}

// ❌ SAI
import { Platform } from "react-native";
export function useAuth() {
  if (Platform.OS === "web") { /* ... */ } // ❌
}
```

#### `src/shared/services/`
**Mục đích**: API calls, business logic

**Ví dụ:**
```typescript
// ✅ ĐÚNG
import axios from "axios";

export class AuthService {
  static async login(phone: string, password: string) {
    const response = await axios.post("/api/auth/login", { phone, password });
    return response.data;
  }
}
```

#### `src/shared/store/`
**Mục đích**: State management với Zustand

**Ví dụ:**
```typescript
// ✅ ĐÚNG
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

#### `src/shared/components/`
**Mục đích**: Cross-platform wrapper components

**Quy tắc:**
- ✅ Sử dụng `Platform.select()` để render platform-specific components
- ✅ Cung cấp unified interface

**Ví dụ:**
```typescript
// ✅ ĐÚNG - ZaloButton.tsx
import { Platform } from "react-native";
import { Button as ZmpButton } from "zmp-ui";
import { TouchableOpacity, Text } from "react-native";

export default function ZaloButton({ title, onPress }) {
  if (Platform.OS === "web") {
    return <ZmpButton onClick={onPress}>{title}</ZmpButton>;
  }
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

---

## 🔧 Native Build Setup

### Expo Managed vs Bare Workflow

**Managed Workflow (Mặc định - Khuyến nghị):**
- ✅ Không cần Android Studio/Xcode
- ✅ Build trên cloud với EAS
- ✅ Dễ dàng update
- ❌ Hạn chế custom native code

**Bare Workflow (Sau khi `expo prebuild`):**
- ✅ Full control native code
- ✅ Có thể add native modules
- ❌ Cần Android Studio/Xcode
- ❌ Phức tạp hơn

### Khi nào cần `expo prebuild`?

**CẦN prebuild khi:**
- Build APK/IPA locally
- Cần custom native code
- Add native modules không hỗ trợ Expo

**KHÔNG cần prebuild khi:**
- Chỉ develop cho Web
- Build với EAS Cloud
- Dùng Expo Go để test

### Lệnh prebuild

```bash
# Tạo native folders (ios/, android/)
npx expo prebuild

# Prebuild cho Android only
npx expo prebuild --platform android

# Prebuild cho iOS only (chỉ trên macOS)
npx expo prebuild --platform ios

# Clean và prebuild lại
npx expo prebuild --clean
```

**⚠️ LƯU Ý:**
- Sau khi prebuild, folders `ios/` và `android/` sẽ được tạo
- Các folders này đã được ignore trong `.gitignore`
- **KHÔNG commit** `ios/` và `android/` vào Git
- Mỗi lần clone project, phải chạy `npx expo prebuild` lại

---

## 🔐 Bảo mật - Files KHÔNG được commit

### ❌ TUYỆT ĐỐI KHÔNG commit:

1. **Environment files:**
   - `.env`
   - `.env.local`
   - `.env.development`
   - `.env.production`
   - Chứa API keys, secrets, database URLs

2. **Android sensitive files:**
   - `android/local.properties` - Chứa đường dẫn SDK local
   - `*.keystore`, `*.jks` - Signing keys cho release builds
   - `android/app/google-services.json` - Firebase config (nếu có)

3. **iOS sensitive files:**
   - `ios/Pods/` - CocoaPods dependencies
   - `ios/.xcode.env.local` - Local Xcode config
   - `*.p12`, `*.mobileprovision` - Certificates

4. **Build outputs:**
   - `*.apk`, `*.aab` - Android builds
   - `*.ipa` - iOS builds
   - `dist/`, `build/` - Web builds

5. **IDE configs:**
   - `.vscode/` - VS Code settings (có thể chứa local paths)
   - `.idea/` - IntelliJ/Android Studio settings

### ✅ NÊN commit:

1. **Source code:**
   - `app/`, `src/` - Application code
   - `assets/` - Images, fonts

2. **Config files:**
   - `package.json`, `package-lock.json`
   - `tsconfig.json`
   - `tailwind.config.js`
   - `metro.config.js`
   - `app.json`, `eas.json`

3. **Documentation:**
   - `README.md`
   - `CONTRIBUTING.md`

4. **CI/CD:**
   - `.github/workflows/`

### 📝 Environment Variables Best Practice

**Tạo `.env.example`:**
```bash
# .env.example - Commit file này
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SOCKET_URL=wss://socket.example.com
```

**Tạo `.env` (local, không commit):**
```bash
# .env - KHÔNG commit
EXPO_PUBLIC_API_URL=https://api.minizalo.com
EXPO_PUBLIC_SOCKET_URL=wss://socket.minizalo.com
EXPO_PUBLIC_API_KEY=your-secret-key-here
```

**Sử dụng trong code:**
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🚀 Development Workflow

### 1. Setup lần đầu
```bash
cd MiniZalo_Frontend
npm install
```

### 2. Development

**Web:**
```bash
npm run web
```

**Mobile (với Expo Go):**
```bash
npm start
# Quét QR code bằng Expo Go app
```

**Mobile (với native build):**
```bash
# Lần đầu: prebuild
npx expo prebuild

# Sau đó:
npm run android  # hoặc npm run ios
```

### 3. Testing

**Type checking:**
```bash
npx tsc --noEmit
```

**Linting:**
```bash
npm run lint
```

**Web build verification:**
```bash
npx expo export -p web
```

### 4. Building

**Web:**
```bash
npx expo export -p web
# Output: dist/
```

**Mobile (EAS Cloud - Khuyến nghị):**
```bash
eas build -p android --profile preview
eas build -p ios --profile preview
```

**Mobile (Local):**
```bash
cd android
./gradlew assembleDebug  # APK: android/app/build/outputs/apk/debug/
```

---

## ⚠️ Common Mistakes

### ❌ SAI:
```typescript
// 1. Import sai platform
// Trong src/views/web/
import { View } from "react-native"; // ❌

// 2. Platform-specific code trong shared
// Trong src/shared/hooks/
if (Platform.OS === "web") { /* ... */ } // ❌

// 3. Commit sensitive files
git add .env  // ❌
git add android/local.properties  // ❌

// 4. Commit native folders
git add ios/  // ❌
git add android/  // ❌
```

### ✅ ĐÚNG:
```typescript
// 1. Import đúng platform
// Trong src/views/web/
import { Page } from "zmp-ui"; // ✅

// 2. Shared code platform-agnostic
// Trong src/shared/hooks/
export function useAuth() { /* pure logic */ } // ✅

// 3. Không commit sensitive files
# Đã có trong .gitignore

// 4. Prebuild khi cần
npx expo prebuild  // ✅
# Sau đó add vào .gitignore
```

---

## 📚 Resources

- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [zmp-ui](https://zalo.me/zmp-ui)
