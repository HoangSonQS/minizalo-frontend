# Contributing to MiniZalo Frontend

Cảm ơn bạn đã đóng góp cho MiniZalo! Tài liệu này cung cấp guidelines để đảm bảo code quality và tránh conflicts.

## 📋 Table of Contents
- [Branch Strategy](#branch-strategy)
- [Team Guidelines](#team-guidelines)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Commit Message Convention](#commit-message-convention)
- [Code Review](#code-review)

## 🌳 Branch Strategy

### Main Branches
- **`main`**: Production code, luôn stable ✅
- **`develop`**: Integration branch cho development 🚧
- **`staging`**: Testing trước production 🧪

### Feature Branches
Format: `feature/<team>/<feature-name>`

**Examples:**
```bash
feature/web/login-ui
feature/mobile/chat-screen
feature/shared/auth-service
```

### Hotfix Branches
Format: `hotfix/<issue-description>`

## 👥 Team Guidelines

### 🌐 Web Team
**Quy tắc:**
- ✅ Chỉ làm việc trong `src/views/web/`
- ✅ Sử dụng `zmp-ui` components
- ✅ Import CSS: `import "zmp-ui/zaui.css"`
- ✅ Test trên browser (Chrome/Firefox) trước khi commit
- ❌ **KHÔNG** sửa code trong `src/views/mobile/`
- ❌ **KHÔNG** import React Native components

**Testing:**
```bash
npm run web
```

### 📱 Mobile Team
**Quy tắc:**
- ✅ Chỉ làm việc trong `src/views/mobile/`
- ✅ Sử dụng React Native components + NativeWind
- ✅ Styling với `className` prop (TailwindCSS)
- ✅ Test trên emulator/device trước khi commit
- ❌ **KHÔNG** sửa code trong `src/views/web/`
- ❌ **KHÔNG** import `zmp-ui`

**Testing:**
```bash
npm run android  # hoặc npm run ios
```

### 🔗 Shared Logic (`src/shared/`)
**Quy tắc:**
- ✅ Code phải **platform-agnostic** (không phụ thuộc platform)
- ✅ Không import `zmp-ui` hoặc React Native specific libraries
- ✅ Cả Web và Mobile team phải review khi sửa shared code
- ✅ Phải test trên **CẢ** Web và Mobile

**Allowed in shared:**
- Hooks (useState, useEffect, custom hooks)
- Services (API calls, business logic)
- Store (Zustand state management)
- Utils, constants, types
- Cross-platform wrapper components (như `ZaloButton.tsx`)

## 🔄 Development Workflow

### 1. Tạo Feature Branch
```bash
# Pull latest code
git checkout develop
git pull origin develop

# Tạo feature branch
git checkout -b feature/web/login-form
```

### 2. Development
```bash
# Làm việc trên code của bạn
# ...

# Commit thường xuyên
git add .
git commit -m "feat(web): add login form UI"
```

### 3. Trước khi Push
```bash
# Pull latest develop
git checkout develop
git pull origin develop

# Rebase feature branch
git checkout feature/web/login-form
git rebase develop

# Resolve conflicts nếu có
# ...

# Run checks
npm run lint
npx tsc --noEmit

# Test trên platform của bạn
npm run web  # hoặc npm run android/ios
```

### 4. Push và tạo PR
```bash
git push origin feature/web/login-form
```
Sau đó tạo Pull Request trên GitHub.

## 🔀 Pull Request Process

### Trước khi tạo PR
- [ ] Code đã được test trên platform của bạn
- [ ] Không có TypeScript errors (`npx tsc --noEmit`)
- [ ] Không có lint errors (`npm run lint`)
- [ ] Đã pull latest `develop` và resolve conflicts
- [ ] Commit messages theo convention

### PR Title Format
```
[WEB/MOBILE/SHARED] Brief description

Examples:
[WEB] Add login form with zmp-ui
[MOBILE] Implement chat screen UI
[SHARED] Extract auth logic to service
```

### PR Description Template
```markdown
## What changed
- Mô tả ngắn gọn những gì đã thay đổi

## Why changed
- Lý do thay đổi (fix bug, new feature, refactor, etc.)

## Screenshots/Recordings
- Đính kèm screenshots hoặc screen recordings nếu có UI changes

## Testing Checklist
- [ ] Tested on Web (for Web team)
- [ ] Tested on Android (for Mobile team)
- [ ] Tested on iOS (for Mobile team)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Shared code tested on both platforms (if applicable)
```

### Review Requirements
| Change Type | Reviewers Required |
|-------------|-------------------|
| Web only (`src/views/web/`) | 1 Web team member |
| Mobile only (`src/views/mobile/`) | 1 Mobile team member |
| Shared (`src/shared/`) | 1 Web + 1 Mobile team member |
| Config files | Tech lead |

## 📝 Commit Message Convention

Format: `<type>(<scope>): <subject>`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `style`: Formatting, styling (CSS/UI changes)
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Build, dependencies, configs

### Scopes
- `web`: Web-specific changes
- `mobile`: Mobile-specific changes
- `shared`: Shared logic changes
- `ci`: CI/CD changes
- `deps`: Dependencies

### Examples
```bash
feat(web): add login form UI with zmp-ui
fix(mobile): resolve crash on chat screen
refactor(shared): extract auth logic to AuthService
style(web): update button colors to match design
docs(readme): add setup instructions for Android
test(shared): add unit tests for AuthService
chore(deps): update expo to 50.0.33
```

## 👀 Code Review

### Reviewers should check:
- [ ] Code follows team guidelines (Web/Mobile/Shared rules)
- [ ] No platform-specific code in shared folder
- [ ] TypeScript types are correct
- [ ] No console.logs or debug code
- [ ] UI matches design (if applicable)
- [ ] No performance issues
- [ ] Error handling is proper

### Review Comments
- 🟢 **Approve**: Code is good to merge
- 🟡 **Request Changes**: Issues must be fixed before merge
- 💬 **Comment**: Suggestions, không block merge

## 🚫 Common Mistakes to Avoid

### ❌ DON'T
```typescript
// ❌ Import zmp-ui in mobile code
import { Button } from "zmp-ui"; // in src/views/mobile/

// ❌ Import React Native in web code
import { View } from "react-native"; // in src/views/web/

// ❌ Platform-specific code in shared
import { Platform } from "react-native"; // in src/shared/hooks/

// ❌ Direct push to main/develop
git push origin main
```

### ✅ DO
```typescript
// ✅ Use zmp-ui only in web
import { Button } from "zmp-ui"; // in src/views/web/

// ✅ Use React Native only in mobile
import { View } from "react-native"; // in src/views/mobile/

// ✅ Platform-agnostic shared code
export function useAuth() { /* ... */ } // in src/shared/hooks/

// ✅ Create PR for all changes
git push origin feature/web/my-feature
```

## 🆘 Need Help?

- **Web issues**: Tag `@web-team` trong PR
- **Mobile issues**: Tag `@mobile-team` trong PR
- **Shared/Architecture**: Tag `@tech-lead`
- **CI/CD**: Check `.github/workflows/frontend-ci.yml`

## 📚 Resources

- [README.md](./README.md) - Project overview
- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [zmp-ui Docs](https://zalo.me/zmp-ui)
- [React Navigation](https://reactnavigation.org/)

---

**Happy Coding! 🚀**
