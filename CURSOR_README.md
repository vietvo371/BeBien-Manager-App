# 🤖 Cursor AI - BeBien Manager Configuration Complete!

## ✨ Chúc mừng Việt!

Dự án **BeBien Manager** của bạn đã được cấu hình hoàn chỉnh để Cursor AI code như một **Senior React Native Engineer**! 🎉

---

## 📦 Files Đã Được Tạo

### 1. Main Configuration
- **`.cursorrules`** (27KB)
  - Core AI brain với tất cả rules và guidelines
  - Tech stack: React Native 0.84.1, TypeScript, Zustand, React Query
  - Project structure và naming conventions
  - Coding standards và best practices
  - Security guidelines
  - Performance optimization rules

### 2. Documentation
- **`.cursorrules-guide.md`** (12KB)
  - Hướng dẫn chi tiết cách sử dụng
  - Ví dụ commands thực tế
  - Workflow cho features phức tạp
  - Pro tips và keyboard shortcuts
  
- **`CURSOR_SETUP.md`** (4KB)
  - Quick start guide
  - Common commands
  - Tips nhanh
  
- **`CURSOR_TEST.md`** (8KB)
  - Test cases để verify configuration
  - Scoring system
  - Real-world scenarios
  - Troubleshooting guide

### 3. Templates
- **`.templates/Component.template.tsx`**
  - Template chuẩn cho React components
  - TypeScript types
  - Hooks pattern
  - Styling guidelines
  
- **`.templates/Screen.template.tsx`**
  - Template chuẩn cho Screens
  - React Query integration
  - FlatList with optimization
  - Navigation setup

---

## 🚀 Quick Start - 3 Bước Để Bắt Đầu

### Bước 1: Reload Cursor
```bash
⌘ + R  (hoặc Ctrl + R)
```
Để Cursor load .cursorrules file mới

### Bước 2: Test Ngay
Nhấn **⌘ + I** (Composer) và gõ:

```
Tạo WelcomeCard component với:
- Title và subtitle props
- onPress callback
- Animation khi xuất hiện
- Dùng theme colors
- TypeScript types đầy đủ
```

### Bước 3: Verify Output
Check xem Cursor có:
- ✅ Tạo file đúng vị trí `src/components/WelcomeCard.tsx`
- ✅ TypeScript interface rõ ràng
- ✅ Import colors từ `theme/colors.ts`
- ✅ Dùng Reanimated cho animation
- ✅ StyleSheet.create() cho styles
- ✅ Export component properly

---

## 🎯 Cursor Hiểu Gì Về Dự Án?

### ✅ Technical Knowledge
- React Native 0.84.1 (New Architecture)
- TypeScript strict mode
- Zustand state management
- React Query cho API calls
- Firebase Cloud Messaging
- React Navigation v7
- Reanimated v4 animations
- i18next internationalization

### ✅ Project Structure
```
src/
├── assets/       # Images, animations, icons
├── components/   # Reusable components
├── navigation/   # Navigation config
├── screens/      # Screen components
├── services/     # API services
├── stores/       # Zustand stores
├── theme/        # Colors, typography
├── types/        # TypeScript types
└── utils/        # Helper functions
```

### ✅ Business Logic
- **Order Cancellation Workflow**:
  Kitchen → Socket → Server → Manager Approval → Cashier Notification
  
- **Role-Based Access**:
  - `is_master = 0`: Cashier (limited access, receives notifications)
  - `is_master = 1`: Manager (full access, approvals, reports)

- **Security Rules**:
  - No revenue data in Cashier view
  - Encrypt sensitive data
  - Token management
  - Role-based notifications

---

## 💡 Các Lệnh Hay Dùng

### 🏗️ Creating New Features

**Tạo Component:**
```
Tạo OrderCard component hiển thị order info với:
- Order number, table, status
- Items list
- Total price
- Status badge với colors
- onPress để navigate to detail
- Animation và theme colors
```

**Tạo Screen:**
```
Tạo OrderListScreen với:
- Fetch orders dùng React Query
- FlatList với pull-to-refresh
- Search và filter
- Loading và error states
- Navigate to detail screen
```

**Tạo Service:**
```
Tạo orderService với:
- getOrders, getOrderById, createOrder, updateOrder, deleteOrder
- Axios instance với interceptor
- Error handling
- TypeScript types
```

**Tạo Store:**
```
Tạo orderStore với Zustand:
- orders state array
- selectedOrder
- Actions: setOrders, selectOrder, clearOrders
- Persist với AsyncStorage
```

### 🔧 Refactoring & Optimization

```
Optimize LoginScreen:
- Extract form logic to custom hook
- Add React.memo where needed
- Use useCallback for handlers
- Improve error handling
```

```
Add biometric authentication to LoginScreen
```

```
Convert hardcoded text to i18n translations
```

### 🐛 Debugging & Fixing

```
Fix TypeScript errors in this file
```

```
Add proper error handling to this API call
```

```
Optimize this FlatList for better performance
```

---

## 📚 Đọc Thêm

### Bắt Đầu
1. **CURSOR_SETUP.md** - Quick start và tips nhanh
2. **.cursorrules-guide.md** - Hướng dẫn chi tiết
3. **CURSOR_TEST.md** - Test cases và troubleshooting

### Templates
- **.templates/Component.template.tsx** - Reference khi tạo components
- **.templates/Screen.template.tsx** - Reference khi tạo screens

### Official Docs
- [React Native](https://reactnative.dev/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## 🎓 Pro Tips

### 1. Be Specific
❌ "Tạo button"
✅ "Tạo PrimaryButton với loading state, disabled state, theme colors, ripple effect"

### 2. Mention Context
✅ "Theo workflow trong .cursorrules"
✅ "Follow coding standards và use theme colors"
✅ "Dùng React Query cho API call"

### 3. Reference Existing Code
✅ "Theo style của @LoginScreen.tsx"
✅ "Similar to @OrderCard component"

### 4. Ask for Explanations
```
Explain order cancellation workflow step by step
```

```
What's the best way to implement real-time sync?
```

### 5. Iterate
Yêu cầu → Review → Refine → Optimize
Không ngại ask Cursor improve code nhiều lần!

---

## ⚡ Keyboard Shortcuts

| Shortcut | Chức năng | Dùng khi nào |
|----------|-----------|--------------|
| **⌘ + L** | Chat | Hỏi đáp, tư vấn nhanh |
| **⌘ + I** | Composer | Tạo/edit nhiều files, big features |
| **⌘ + K** | Inline Edit | Sửa code trong editor |
| **⌘ + Shift + L** | Chat with selection | Hỏi về code đang select |

---

## 🎯 Mục Tiêu Đạt Được

Sau khi setup này, Cursor AI sẽ:

- ✅ **Code Quality**: Clean, maintainable, professional code
- ✅ **Type Safety**: TypeScript strict mode, no `any`
- ✅ **Performance**: Optimized re-renders, memoization
- ✅ **Security**: Proper auth, encryption, role-based access
- ✅ **Best Practices**: Follow React Native patterns
- ✅ **Consistency**: Naming conventions, file structure
- ✅ **i18n Ready**: No hardcoded strings
- ✅ **Error Handling**: Try-catch, loading states, error messages
- ✅ **Testing Ready**: Clean code dễ test

---

## 🔥 Example: Build Complete Feature

### Yêu cầu thực tế
```
Implement order approval feature:

Manager View:
- Screen hiển thị pending orders (đang chờ duyệt)
- Mỗi order có nút Approve và Reject
- Khi approve: gọi API, gửi socket notification to Cashier
- Loading states và error handling

Cashier View:
- Listen socket notification (only is_master = 0)
- Show popup when order approved
- Auto refresh order list
- Play sound notification

Requirements:
- Follow .cursorrules workflow
- TypeScript types đầy đủ
- React Query cho API
- Reanimated animations
- i18n translations
- Error handling complete
```

### Kết quả mong đợi
Cursor sẽ tạo:
- `PendingOrdersScreen.tsx`
- `OrderApprovalCard.tsx`
- `pendingOrderService.ts`
- `useOrderSocket.ts` hook
- `useNotification.ts` hook
- `pending-order.types.ts`
- Navigation updates
- Translation keys
- All with proper error handling and types!

---

## 🎊 You're All Set!

Dự án BeBien Manager giờ đã sẵn sàng để code với Cursor AI như một Senior Engineer! 

### Next Steps:
1. ✅ Test với simple component (WelcomeCard)
2. ✅ Try tạo một screen hoàn chỉnh
3. ✅ Implement một feature nhỏ end-to-end
4. ✅ Share feedback và refine .cursorrules nếu cần

---

## 🆘 Cần Hỗ Trợ?

### Cursor không follow rules?
1. Reload Cursor (⌘ + R)
2. Explicitly mention: "Follow .cursorrules"
3. Check .cursorrules syntax

### Code không đúng standards?
1. Review .cursorrules file
2. Be more specific in commands
3. Reference templates

### Performance issues?
1. Close unused editors
2. Restart Cursor
3. Clear Cursor cache

---

**Happy Coding with Cursor AI!** 🚀🎉

Made with ❤️ for BeBien Manager
by Dragon Lab Team

---

_Last updated: March 7, 2026_
_Version: 1.0.0_
