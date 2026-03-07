# ⚡ Cursor UI Quick Cheat Sheet - BeBien Manager

Commands ngắn gọn, copy-paste nhanh! 🚀

---

## 🎨 Basic Components (1-liner)

```bash
# Button
Tạo PrimaryButton với variants, loading, disabled, icon, ripple, theme colors, TS types

# Icon Button  
Tạo IconButton với vector-icons, size variants, badge, ripple, theme colors

# Text
Tạo Typography với h1-h6/body variants, colors, weight, align, i18n

# Badge
Tạo Badge với value, variants, position, animation, max value, theme colors

# Avatar
Tạo Avatar với image, size variants, initials fallback, status dot, border, onPress
```

---

## 📝 Form Components

```bash
# Text Input
Tạo TextInput với label, error, icons, password toggle, validation, clear, focus animation, theme, TS

# Search Input
Tạo SearchInput với icon, clear button, debounce, suggestions, loading, animation

# Dropdown
Tạo Dropdown với search, multi-select, custom render, bottom sheet, animation, theme, TS

# Checkbox
Tạo Checkbox với label, checked state, indeterminate, disabled, animation, theme

# Radio Group
Tạo RadioGroup với options array, vertical/horizontal, disabled, animation, theme

# Switch
Tạo Switch với label, size variants, animation, haptic, loading, theme

# Date Picker
Tạo DatePicker với min/max, format DD/MM/YYYY, modal, clear, error, theme, i18n

# Time Picker
Tạo TimePicker với 12h/24h, interval, modal, clear, error, theme
```

---

## 🃏 Cards & Lists

```bash
# Basic Card
Tạo Card với title, subtitle, image, actions, onPress, shadow, animation, theme

# Order Card (Project Specific)
Tạo OrderCard với order#, table, status badge, items, total, action buttons, swipe actions, animation, theme theo status

# Stats Card
Tạo StatsCard với icon, title, value, change%, subtitle, gradient, count animation, skeleton, theme

# List Item
Tạo ListItem với icon, title, subtitle, badge, swipe actions, long press, animation, theme

# Optimized FlatList
Tạo OptimizedFlatList với pull-refresh, load more, empty state, error, search, filter, performance optimized, animation

# Section List
Tạo SectionList với sticky headers, collapse/expand, badge count, pull-refresh, animation
```

---

## 🧭 Navigation

```bash
# Bottom Tab Bar
Tạo Custom BottomTabBar với 4-5 tabs, icons, badge, animated indicator, haptic, safe area, theme

# Screen Header
Tạo ScreenHeader với title, back button, actions, search bar, shadow, scroll animation, theme

# Search Header
Tạo SearchHeader với full-width input, recent searches, trending, animated expand, clear history
```

---

## 💬 Modals & Dialogs

```bash
# Bottom Sheet
Tạo BottomSheet với draggable handle, snap points, backdrop dismiss, keyboard aware, animation, safe area, theme

# Modal
Tạo Modal với title, content, actions, close button, backdrop blur, scale animation, keyboard avoiding

# Confirm Dialog
Tạo ConfirmDialog với icon, message, confirm/cancel buttons, destructive style, animation, theme

# Toast
Tạo Toast với message, type (success/error/warning/info), duration, action, icon, position, auto dismiss, swipe dismiss

# Action Sheet
Tạo ActionSheet với options array, cancel button, slide animation, safe area, theme
```

---

## 🎬 Animations

```bash
# Fade In
Tạo FadeInView với duration, delay, Reanimated FadeIn

# Slide In
Tạo SlideInView với direction (left/right/top/bottom), duration, spring, Reanimated

# Scale In
Tạo ScaleInView với initialScale, duration, spring, Reanimated ZoomIn

# Animated List Item
Tạo AnimatedListItem với stagger delay, fade+slide, enter/exit, spring

# Pulse
Tạo PulseView với continuous pulse, scale, color change, loop

# Shake
Tạo ShakeView với shake on error, intensity, trigger
```

---

## 📐 Layout

```bash
# Screen Container
Tạo ScreenContainer với safe area, padding variants, keyboard avoiding, scroll/view mode, loading overlay, theme

# Grid
Tạo Grid với 2/3/4 columns, gap, aspect ratio, responsive, renderItem

# Spacer
Tạo Spacer với xs/sm/md/lg/xl sizes, horizontal/vertical

# Divider
Tạo Divider với thickness, color, margin, solid/dashed, text-in-middle, theme
```

---

## 🖼️ Images & Icons

```bash
# Icon
Tạo Icon với vector-icons name, size variants, color, library, onPress, badge, theme

# Cached Image
Tạo CachedImage với uri, placeholder, error fallback, blur, progressive, cache management

# Image Viewer
Tạo ImageViewer với images array, zoom/pinch, swipe, close/share buttons, counter, transitions
```

---

## ⏳ Loading & Empty

```bash
# Loading Spinner
Tạo LoadingSpinner với size variants, overlay mode, message, backdrop blur, animation, theme

# Skeleton
Tạo Skeleton với text/circular/rectangular variants, pulse shimmer, theme. Variants: SkeletonCard, SkeletonList, SkeletonProfile

# Progress Bar
Tạo ProgressBar với linear/circular, animated progress, label%, indeterminate, theme

# Empty State
Tạo EmptyState với icon, title, description, action button, Lottie animation, theme. Variants: NoData, NoResults, NoConnection, Error

# Error State
Tạo ErrorState với error icon, message, retry button, go back, error code, animation, theme
```

---

## 📱 Complete Screens

```bash
# Orders List
Tạo OrdersListScreen với tab filter, search, FlatList+OrderCard, pull-refresh, load more, empty/error states, FAB, swipe actions, filter modal, React Query, navigation typed, i18n

# Order Detail
Tạo OrderDetailScreen với header+actions, order info card, customer section, items list, totals, status timeline, action buttons (cancel/complete/print), edit mode, loading/error, navigation params, React Query mutation

# Products List
Tạo ProductsListScreen với grid 2-col, category tabs, search+sort, ProductCard, add-to-cart, quick view modal, pull-refresh, infinite scroll, React Query

# Profile
Tạo ProfileScreen với avatar+edit, user info, settings list, logout, version, dark mode toggle, language selector, notification prefs, update modal

# Order Form
Tạo OrderFormScreen với step indicator, table selection, product selection+search, quantity counter, notes, summary, save button sticky, validation, loading, success/error, React Query mutation, i18n

# Login
Tạo LoginScreen với logo animation, email input, password show/hide, remember me, login button+loading, forgot/register links, biometric button, error messages, keyboard avoiding, theme, i18n

# Dashboard (Role-based)
Tạo DashboardScreen với stats cards (orders/revenue/avg), chart by hour, top products, recent orders, quick actions, pull-refresh, date range, export button, is_master visibility check
```

---

## 🔧 Special Features (Project)

```bash
# Order Status Timeline
Tạo OrderStatusFlow với timeline viz, status steps (ordered→preparing→ready→delivered), active highlight, timestamps, animated transitions, status icons

# Table Map
Tạo TableMap với grid layout, status (available/occupied/reserved), table numbers, occupancy time, onSelectTable, real-time updates, zoom/pan, animated status

# Live Order Feed
Tạo LiveOrderFeed với real-time updates, Socket/FCM, auto refresh, new order slide-in animation, sound notification, badge count, filter by status

# Notification Center
Tạo NotificationCenter với list, mark read/unread, delete, group by date, clear all, empty state, navigate to related, badge update

# Order Approval (Manager)
Tạo OrderApprovalScreen với pending orders list, approve/reject buttons, Socket notification to Cashier (is_master=0 only), status update, confirmation dialog, React Query mutation, role check
```

---

## 🎯 Formula Template

```
Tạo [Component] với [feature1], [feature2], [props], [states], theme colors, animation, TypeScript types, i18n, error handling
```

### Example:
```
Tạo ProductCard với image, name, price, add-to-cart button, favorite icon, discount badge, onPress, loading state, theme colors, scale animation, TS types
```

---

## 💡 Pro Tips

### Add These to ANY Command:
- `Follow .cursorrules guidelines`
- `Dùng theme colors từ theme/colors.ts`
- `TypeScript strict với proper types`
- `Reanimated cho animations`
- `i18n cho tất cả text`
- `React Query cho API calls`
- `Error handling complete`
- `Loading states everywhere`

---

## 🔥 Most Used Commands

### Top 10:
1. `Tạo OrderCard với...` (30x/day)
2. `Tạo TextInput với...` (25x/day)
3. `Tạo Modal với...` (20x/day)
4. `Tạo [Screen]Screen với...` (20x/day)
5. `Tạo LoadingSpinner với...` (15x/day)
6. `Tạo PrimaryButton với...` (15x/day)
7. `Tạo EmptyState với...` (10x/day)
8. `Tạo Dropdown với...` (10x/day)
9. `Tạo BottomSheet với...` (10x/day)
10. `Optimize component này...` (10x/day)

---

## 📋 Workflow Quick Commands

### New Feature Start
```
⌘ + I → Tạo [Feature]Screen với [requirements] follow .cursorrules
⌘ + I → Tạo [feature]Service với API calls, React Query ready, TS types
⌘ + I → Tạo [Feature]Card component với [details]
⌘ + I → Update navigation add [Feature]Screen với params typed
```

### Refactor Existing
```
⌘ + K (select code) → Optimize với React.memo, useCallback, proper types
⌘ + K → Convert to TypeScript với proper interfaces
⌘ + K → Add error handling và loading states
⌘ + K → Extract logic to custom hook
```

### Fix & Polish
```
⌘ + K → Add i18n translations
⌘ + K → Add theme colors
⌘ + K → Add animations với Reanimated
⌘ + K → Fix TypeScript errors
```

---

## 🎨 Styling Shortcuts

```bash
# Quick Styles
padding: 16           # theme spacing.md
margin: 8             # theme spacing.sm
borderRadius: 12      # theme borderRadius.large
shadow: elevation 3   # theme shadows
color: colors.primary[500]  # theme colors
fontSize: 16          # theme typography.body1
fontWeight: '600'     # theme typography.semibold
```

---

## ⚡ Speed Coding Tips

1. **Start with template**: Reference `.templates/` files
2. **Copy base command**: From this cheat sheet
3. **Customize details**: Add your specific requirements
4. **Mention context**: "Follow .cursorrules", "use theme", "TS types"
5. **Generate**: ⌘ + I → Paste → Enter
6. **Review & refine**: Quick check → Ask for improvements if needed

---

**Bookmark this page!** 📌

Press **⌘ + F** to search for any component! 🔍

Happy Speed Coding! 🚀⚡

---

_Version: 1.0.0_
_Last updated: March 7, 2026_
