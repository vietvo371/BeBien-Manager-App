# 🤖 Cursor AI Configuration - BeBien Manager

## ✅ Đã Setup Xong!

Dự án BeBienManager đã được cấu hình để Cursor AI code như một **Senior React Native Engineer**.

## 📁 Files Đã Tạo

1. **`.cursorrules`** - Bộ não của AI, chứa tất cả rules và guidelines
2. **`.cursorrules-guide.md`** - Hướng dẫn chi tiết cách sử dụng
3. **`CURSOR_SETUP.md`** - File này

## 🚀 Quick Start

### Bắt Đầu Ngay
1. Mở Cursor
2. Nhấn **⌘ + I** (hoặc Ctrl + I trên Windows)
3. Gõ yêu cầu, ví dụ:

```
Tạo OrderCard component hiển thị order info với animation
```

### Các Lệnh Hay Dùng

**Tạo Component:**
```
Tạo LoadingSpinner với Reanimated animation
```

**Tạo Screen:**
```
Tạo PendingOrdersScreen cho Manager approval theo workflow trong .cursorrules
```

**Tạo Service:**
```
Tạo orderService với React Query integration
```

**Fix & Optimize:**
```
Optimize component này và add error handling
```

## 🎯 Cursor Hiểu Gì Về Project?

- ✅ Tech Stack: React Native 0.84.1, TypeScript, Zustand, React Query
- ✅ Architecture: Screens, Components, Services, Stores structure
- ✅ Workflow: Order cancellation từ Kitchen → Manager → Cashier
- ✅ Roles: is_master = 0 (Cashier), is_master = 1 (Manager)
- ✅ Security: Data restrictions, encryption, token handling
- ✅ Styling: Theme system, colors, animations
- ✅ Real-time: Socket/FCM notifications
- ✅ Best Practices: TypeScript strict mode, performance optimization, i18n

## 📚 Đọc Thêm

Xem file **`.cursorrules-guide.md`** để biết:
- Cách dùng Chat vs Composer
- Ví dụ câu lệnh thực tế
- Workflow cho features phức tạp
- Pro tips và tricks
- Keyboard shortcuts

## 💡 Tips Nhanh

1. **Càng cụ thể càng tốt** - Đừng nói "tạo button", hãy nói "tạo PrimaryButton với theme colors, ripple effect, loading state"

2. **Nhắc về context** - "Theo workflow trong .cursorrules", "Dùng theme colors", "Follow TypeScript guidelines"

3. **Ask for explanations** - "Giải thích cách implement này" để hiểu sâu hơn

4. **Iterate** - Yêu cầu → Review → Refine → Optimize

## 🎨 Ví Dụ Thực Tế

### Tạo màn hình hoàn chỉnh
```
Tạo OrderDetailScreen với:
- Lấy order detail từ API dùng React Query
- Hiển thị order info, items list, total
- Status badge với colors theo status
- Cancel button với confirmation dialog
- Loading và error states
- Animation khi screen enter
- Follow design system và coding standards
```

### Implement real-time feature
```
Implement order notification flow:
- Setup FCM listener
- Khi nhận notification, update order list
- Chỉ show notification cho is_master = 0 (Cashier)
- Play sound và vibration
- Navigate to order detail khi tap notification
- Handle app ở background và foreground
```

## 🎊 Kết Quả Mong Đợi

Sau khi setup này, Cursor sẽ:
- ✅ Generate code type-safe với TypeScript
- ✅ Follow project structure và naming conventions
- ✅ Apply performance optimizations tự động
- ✅ Handle errors properly
- ✅ Use i18n translations thay vì hardcode text
- ✅ Follow React Native best practices
- ✅ Security-conscious (không expose sensitive data)
- ✅ Maintainable và clean code

## 🚀 Let's Code Like a Pro!

Happy coding with Cursor AI! 🎉

---

**Note**: Nếu Cursor không follow rules, hãy:
1. Reload Cursor (⌘ + R)
2. Nhắc lại: "Follow .cursorrules guidelines"
3. Check file .cursorrules có bị lỗi syntax không
