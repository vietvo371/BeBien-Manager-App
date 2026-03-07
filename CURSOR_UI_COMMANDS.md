# 🎨 Cursor UI Commands - BeBien Manager

Tổng hợp **tất cả các câu lệnh UI** để viết giao diện nhanh và hiệu quả cho dự án BeBienManager.

---

## 📋 Mục Lục

1. [Basic Components](#1-basic-components)
2. [Form Components](#2-form-components)
3. [Card & List Components](#3-card--list-components)
4. [Navigation Components](#4-navigation-components)
5. [Modal & Dialog](#5-modal--dialog)
6. [Animation Components](#6-animation-components)
7. [Layout Components](#7-layout-components)
8. [Icon & Image](#8-icon--image)
9. [Loading & Empty States](#9-loading--empty-states)
10. [Screen Templates](#10-screen-templates)
11. [Theme & Styling](#11-theme--styling)
12. [Responsive UI](#12-responsive-ui)
13. [Complex Features](#13-complex-features)

---

## 1. Basic Components

### 1.1 Button Components

#### Primary Button
```
Tạo PrimaryButton component với:
- variant: primary, secondary, outline, ghost
- size: small, medium, large
- loading state với spinner
- disabled state
- icon support (left/right)
- onPress callback
- Ripple effect animation
- Dùng theme colors
- TypeScript props interface
- Accessible (accessibilityLabel, accessibilityRole)
```

#### Icon Button
```
Tạo IconButton component với:
- Icon name từ react-native-vector-icons
- size: small (32x32), medium (44x44), large (56x56)
- variant: filled, outline, text
- Background color theo theme
- Ripple animation
- Badge support (notification count)
- onPress callback
- Disabled state
```

#### Floating Action Button (FAB)
```
Tạo FAB component với:
- Position: bottom-right, bottom-center, bottom-left
- Icon support
- Label (optional)
- Extended FAB với text
- Animation: scale on press, slide in on mount
- Shadow elevation
- Theme colors
- onPress handler
```

### 1.2 Text Components

#### Typography Component
```
Tạo Typography component với:
- variants: h1, h2, h3, h4, h5, h6, body1, body2, caption, button
- weight: regular, medium, semibold, bold
- color props (primary, secondary, error, success, etc.)
- align: left, center, right, justify
- numberOfLines prop
- ellipsizeMode
- Dùng theme typography
- i18n support
```

#### Badge Component
```
Tạo Badge component với:
- value: number hoặc string
- variant: default, primary, error, success, warning
- size: small, medium, large
- position: top-right, top-left, bottom-right, bottom-left
- max value (ví dụ: 99+)
- dot mode (chỉ hiện dot không có số)
- Animation khi value thay đổi
```

---

## 2. Form Components

### 2.1 Text Input

#### Standard Input
```
Tạo TextInput component với:
- label và placeholder
- value và onChangeText
- error state với error message
- left và right icon support
- prefix và suffix (VD: đơn vị tiền tệ)
- type: text, email, password, number, phone
- Show/hide password toggle
- Character counter (maxLength)
- Clear button
- Focus/blur animation
- Theme colors
- TypeScript types
- Validation support
```

#### Search Input
```
Tạo SearchInput component với:
- Search icon left
- Clear button right (hiện khi có text)
- onSearch callback
- debounce search (500ms)
- Recent searches list (optional)
- Suggestions dropdown
- Loading indicator trong input
- onFocus/onBlur handlers
- Animated border khi focus
```

### 2.2 Selection Inputs

#### Dropdown/Picker
```
Tạo Dropdown component với:
- label và placeholder
- items array với { label, value, icon }
- selectedValue và onValueChange
- Search trong dropdown (nếu items > 10)
- Multiple selection support
- Custom render item
- Error state
- Disabled items
- Section headers (grouped items)
- Bottom sheet modal trên mobile
- Animated open/close
```

#### Checkbox
```
Tạo Checkbox component với:
- label text
- checked state và onChange
- size: small, medium, large
- disabled state
- error state
- indeterminate state (for select all)
- Custom icon
- Animation khi check/uncheck
- Color theo theme
- Accessible
```

#### Radio Button
```
Tạo RadioButton và RadioGroup components với:
- options array
- selectedValue và onValueChange
- Layout: vertical hoặc horizontal
- disabled state
- Custom render option
- Error state với message
- Animation khi select
- Theme colors
```

#### Switch/Toggle
```
Tạo Switch component với:
- value và onValueChange
- label (left hoặc right)
- disabled state
- size: small, medium, large
- Colors: track và thumb colors
- Smooth animation
- Haptic feedback (optional)
- Loading state
```

### 2.3 Date & Time

#### Date Picker
```
Tạo DatePicker component với:
- label và placeholder
- selectedDate và onDateChange
- min và max date
- Mode: date, time, datetime
- Format display (DD/MM/YYYY)
- Modal picker cho iOS/Android
- Clear button
- Error state
- Disabled dates
- Theme colors
- i18n date format
```

#### Time Picker
```
Tạo TimePicker component với:
- selectedTime và onTimeChange
- 12h hoặc 24h format
- minute interval (5, 10, 15, 30)
- Modal picker
- Clear button
- Error state
- Theme colors
```

---

## 3. Card & List Components

### 3.1 Card Components

#### Basic Card
```
Tạo Card component với:
- title, subtitle, description
- image/thumbnail (optional)
- Actions (buttons ở bottom)
- onPress (toàn bộ card clickable)
- Elevation shadow
- Border radius
- Padding variants
- Background color theo theme
- Animated press effect
```

#### Order Card
```
Tạo OrderCard component cho dự án với:
- Order number và date/time
- Table number với icon
- Status badge (pending, preparing, completed, cancelled)
- Items count
- Total price với currency format
- Customer name (optional)
- Action buttons: View Detail, Cancel, Complete
- Swipeable actions (swipe left to cancel)
- Long press menu
- Animation khi status thay đổi
- Theme colors theo status
```

#### Stats Card
```
Tạo StatsCard component với:
- Icon left
- Title
- Value (số lớn, bold)
- Change percentage (up/down arrow, màu xanh/đỏ)
- Subtitle/description
- onPress navigation
- Gradient background (optional)
- Animation count up khi mount
- Skeleton loading state
```

### 3.2 List Components

#### FlatList Optimized
```
Tạo OptimizedFlatList wrapper component với:
- data array
- renderItem function
- Loading indicator (top)
- Pull to refresh
- Empty state component
- Error state
- Load more pagination (infinite scroll)
- Search integration
- Filter bar
- Performance: getItemLayout, keyExtractor, memo
- Animated list items (stagger animation)
```

#### List Item
```
Tạo ListItem component với:
- Left icon/avatar
- Title và subtitle
- Right icon/chevron
- Badge (notification count)
- onPress handler
- Swipeable actions (left: edit, right: delete)
- Long press menu
- Divider (optional)
- Disabled state
- Animation on press
```

#### Section List
```
Tạo SectionList component với:
- sections array với { title, data }
- Sticky section headers
- renderItem và renderSectionHeader
- Collapse/expand sections
- Section count badge
- Pull to refresh
- Empty state per section
- Animated section expand
```

---

## 4. Navigation Components

### 4.1 Tab Bar

#### Bottom Tab Bar
```
Tạo Custom Bottom Tab Bar với:
- 4-5 tabs với icons
- Active/inactive states với colors
- Badge on tab (notification)
- Label hiển thị/ẩn theo scroll
- Animated indicator
- Haptic feedback on tap
- Safe area insets
- Theme colors
- Icon từ vector-icons
```

#### Top Tab Bar
```
Tạo Top Tab Bar với:
- Scrollable tabs
- Active indicator (underline hoặc background)
- Badge support
- Animated scroll to active
- Center active tab
- Custom render tab
- Theme colors
```

### 4.2 Header Components

#### Screen Header
```
Tạo ScreenHeader component với:
- Title (text hoặc logo)
- Back button (left)
- Actions buttons (right) - max 3
- Search bar (expandable)
- Shadow/elevation
- Transparent background (cho scroll)
- Gradient background
- Safe area top
- Animation on scroll
- Theme colors
```

#### Search Header
```
Tạo SearchHeader component với:
- Search input full width
- Cancel/close button
- Recent searches list
- Trending searches
- Animated expand/collapse
- Auto focus input
- Clear all history
```

---

## 5. Modal & Dialog

### 5.1 Modal

#### Bottom Sheet Modal
```
Tạo BottomSheet component với:
- Content component
- height: auto, half, full
- Draggable handle
- Backdrop dismiss
- Keyboard aware
- Snap points
- Animated open/close
- onDismiss callback
- Safe area bottom
- Theme colors
```

#### Center Modal
```
Tạo Modal component với:
- title và content
- Actions (primary, secondary buttons)
- Close button (X)
- Backdrop blur
- Animated scale in/out
- onDismiss callback
- Keyboard avoiding
- Max width cho tablet
```

### 5.2 Dialog & Alert

#### Confirmation Dialog
```
Tạo ConfirmDialog component với:
- Title và message
- Icon (warning, info, success, error)
- Primary button (Confirm)
- Secondary button (Cancel)
- Destructive action styling (red)
- onConfirm và onCancel callbacks
- Backdrop dismiss (optional)
- Animation
- Theme colors
```

#### Toast/Snackbar
```
Tạo Toast component với:
- message text
- type: success, error, warning, info
- Duration: 2s, 3s, 5s
- Action button (optional)
- Icon theo type
- Position: top, bottom
- Animated slide in/out
- Auto dismiss
- Swipe to dismiss
- Multiple toast queue
```

#### Action Sheet
```
Tạo ActionSheet component với:
- title
- options array với { label, icon, onPress, destructive }
- Cancel button
- Animated slide up from bottom
- onDismiss callback
- Safe area bottom
- Theme colors
```

---

## 6. Animation Components

### 6.1 Enter Animations

#### Fade In View
```
Tạo FadeInView component với:
- children
- duration (default 300ms)
- delay (optional)
- onAnimationEnd callback
- Dùng Reanimated FadeIn
```

#### Slide In View
```
Tạo SlideInView component với:
- direction: left, right, top, bottom
- duration
- distance
- spring animation
- Dùng Reanimated SlideInLeft/Right/Up/Down
```

#### Scale In View
```
Tạo ScaleInView component với:
- initialScale (0.8)
- duration
- spring effect
- Dùng Reanimated ZoomIn
```

### 6.2 Transition Animations

#### Animated List Item
```
Tạo AnimatedListItem với:
- Stagger delay theo index
- Fade + Slide animation
- Enter/exit animations
- Spring physics
```

#### Page Transition
```
Tạo PageTransition wrapper với:
- Fade cross-dissolve
- Slide horizontal/vertical
- Scale transition
- Custom timing
```

### 6.3 Loading Animations

#### Pulse Animation
```
Tạo PulseView component với:
- Continuous pulse effect
- Scale variation
- Color change
- Loop infinitely
```

#### Shake Animation
```
Tạo ShakeView component với:
- Shake on error
- Configurable intensity
- Trigger by prop change
```

---

## 7. Layout Components

### 7.1 Container

#### Screen Container
```
Tạo ScreenContainer component với:
- Safe area handling
- Padding variants (none, small, medium, large)
- Background color theo theme
- Keyboard avoiding view
- ScrollView hoặc View
- Loading overlay
- Error boundary
```

#### Card Container
```
Tạo CardContainer component với:
- Shadow elevation
- Border radius
- Padding
- Background color
- onPress (optional)
- Disabled state
```

### 7.2 Grid & Spacing

#### Grid Layout
```
Tạo Grid component với:
- columns: 2, 3, 4
- gap spacing
- Item aspect ratio
- Responsive columns
- renderItem function
```

#### Spacer
```
Tạo Spacer component với:
- size: xs, sm, md, lg, xl (4, 8, 16, 24, 32)
- horizontal hoặc vertical
```

### 7.3 Divider

#### Divider
```
Tạo Divider component với:
- thickness
- color theo theme
- margin vertical
- Variant: solid, dashed
- Text in middle (optional)
```

---

## 8. Icon & Image

### 8.1 Icons

#### Icon Component
```
Tạo Icon wrapper component với:
- name từ vector-icons
- size: xs, sm, md, lg, xl (16, 20, 24, 32, 40)
- color theo theme
- library: MaterialIcons, Ionicons, FontAwesome, etc.
- onPress handler
- Badge overlay
```

#### Icon Button
```
[Xem section 1.1]
```

### 8.2 Images

#### Cached Image
```
Tạo CachedImage component với:
- source (uri hoặc local)
- Placeholder khi loading
- Error fallback image
- Blur placeholder
- Progressive loading
- ResizeMode
- onLoad callback
- Cache management
```

#### Avatar
```
Tạo Avatar component với:
- source (image uri)
- size: xs, sm, md, lg, xl
- Fallback với initials
- Status indicator (online/offline dot)
- Border color
- onPress handler
- Badge overlay
```

#### Image Viewer
```
Tạo ImageViewer component với:
- images array
- Current index
- Zoom/pinch support
- Swipe to change
- Close button
- Share button
- Counter (1/5)
- Animated transitions
```

---

## 9. Loading & Empty States

### 9.1 Loading States

#### Loading Spinner
```
Tạo LoadingSpinner component với:
- size: small, medium, large
- color theo theme
- Overlay mode (full screen)
- message text (optional)
- Backdrop blur
- Animated rotation smooth
```

#### Skeleton Loader
```
Tạo Skeleton component với:
- variant: text, circular, rectangular
- width và height
- Pulse animation
- Theme colors (shimmer effect)
- Multiple skeletons layout:
  - SkeletonCard
  - SkeletonList
  - SkeletonProfile
```

#### Progress Bar
```
Tạo ProgressBar component với:
- progress (0-1 hoặc 0-100)
- variant: linear, circular
- color theo theme
- Animated progress change
- Label với percentage
- indeterminate mode
```

### 9.2 Empty States

#### Empty State
```
Tạo EmptyState component với:
- Illustration/icon
- Title
- Description/message
- Action button (optional)
- Animation (Lottie hoặc Reanimated)
- Theme colors
- Variants:
  - NoData
  - NoResults
  - NoConnection
  - Error
```

#### Error State
```
Tạo ErrorState component với:
- Error icon/illustration
- Error message
- Retry button
- Go back button
- Error code (optional)
- Animation
- Theme colors
```

---

## 10. Screen Templates

### 10.1 List Screens

#### Orders List Screen
```
Tạo OrdersListScreen với:
- Tab bar filter (All, Pending, Completed, Cancelled)
- Search bar
- FlatList với OrderCard items
- Pull to refresh
- Load more pagination
- Empty state
- Error state
- Floating "Add Order" button
- Navigate to detail on tap
- Swipe actions (cancel, complete)
- Filter modal (date, status, table)
- React Query integration
- i18n translations
```

#### Products List Screen
```
Tạo ProductsListScreen với:
- Grid layout (2 columns)
- Category filter tabs
- Search và sort
- ProductCard với image, name, price
- Add to cart button
- Quick view modal
- Pull to refresh
- Infinite scroll
- React Query
```

### 10.2 Detail Screens

#### Order Detail Screen
```
Tạo OrderDetailScreen với:
- Header với back button và actions
- Order info card (number, date, table, status)
- Customer info section
- Items list với quantity và price
- Subtotal, tax, total
- Status timeline
- Action buttons (Cancel, Complete, Print)
- Edit mode
- Loading states
- Error handling
- Navigation params typed
- React Query mutation
```

#### Profile Screen
```
Tạo ProfileScreen với:
- Avatar với edit button
- User info (name, email, phone, role)
- Settings list items
- Logout button
- Version info
- Dark mode toggle
- Language selector
- Notification preferences
- Update profile modal
```

### 10.3 Form Screens

#### Add/Edit Order Screen
```
Tạo OrderFormScreen với:
- Step indicator (Table → Items → Confirm)
- Table selection
- Product selection với search
- Quantity counter per item
- Notes/special requests
- Summary preview
- Save button (sticky bottom)
- Validation
- Loading state
- Success/error feedback
- React Query mutation
- i18n
```

#### Login Screen
```
Tạo LoginScreen với:
- Logo animation
- Email/username input
- Password input với show/hide toggle
- Remember me checkbox
- Login button với loading
- Forgot password link
- Register link
- Biometric login button (Face ID/Touch ID)
- Error messages
- Keyboard avoiding
- Theme colors
- i18n
```

---

## 11. Theme & Styling

### 11.1 Theme Provider

#### Setup Theme
```
Tạo ThemeProvider wrapper với:
- Light và dark theme
- Theme toggle function
- Persist theme preference
- Theme context
- Custom colors
- Typography scale
- Spacing scale
- Border radius values
- Shadow/elevation presets
```

### 11.2 Custom Hooks

#### useTheme Hook
```
Tạo useTheme custom hook với:
- Current theme (light/dark)
- Colors object
- toggleTheme function
- isDark boolean
```

#### useResponsive Hook
```
Tạo useResponsive hook với:
- isPhone, isTablet, isDesktop booleans
- Screen dimensions
- Orientation
- Safe area insets
- Font scale
```

---

## 12. Responsive UI

### 12.1 Breakpoints

#### Responsive Layout
```
Tạo ResponsiveView component với:
- phone, tablet, desktop components
- Auto switch based on width
- Orientation support
- Padding adjustment
```

#### Responsive Text
```
Tạo ResponsiveText component với:
- Auto font size scaling
- Breakpoint-based sizes
- Max lines responsive
```

### 12.2 Safe Area

#### Safe Area View
```
Tạo SafeView component với:
- edges: top, bottom, left, right
- Conditional rendering
- Background color
```

---

## 13. Complex Features

### 13.1 Order Management

#### Order Status Flow
```
Tạo OrderStatusFlow component với:
- Timeline visualization
- Status steps (Ordered → Preparing → Ready → Delivered)
- Active step highlight
- Timestamp per step
- Animated transitions
- Icons per status
```

#### Table Layout Map
```
Tạo TableMap component với:
- Grid layout của tables
- Table status (available, occupied, reserved)
- Table number
- Occupancy time
- onSelectTable callback
- Real-time status update
- Zoom/pan support
- Animated status changes
```

### 13.2 Real-time Updates

#### Live Order Feed
```
Tạo LiveOrderFeed component với:
- Real-time order updates
- Socket/FCM integration
- Auto refresh list
- New order animation (slide in top)
- Sound notification
- Badge count
- Filter by status
```

#### Notification Center
```
Tạo NotificationCenter component với:
- Notification list
- Mark as read/unread
- Delete notification
- Group by date
- Clear all button
- Empty state
- Navigate to related screen
- Badge count update
```

### 13.3 Analytics Dashboard

#### Dashboard Cards
```
Tạo DashboardScreen với:
- Stats cards (Today Orders, Revenue, Avg Order Value)
- Chart: orders by hour
- Top products list
- Recent orders list
- Quick actions
- Pull to refresh
- Date range selector
- Export data button
- Role-based visibility (is_master check)
```

---

## 🎯 Tips Để Viết Commands Hiệu Quả

### ✅ Structure Tốt
```
Tạo [ComponentName] component với:
- Feature 1 với chi tiết
- Feature 2 với chi tiết
- Props: prop1, prop2 với types
- States: state1, state2
- Styling: theme colors, responsive
- Animation: effect nào
- Error handling
- TypeScript types
- i18n support
```

### ✅ Mention Standards
```
Follow .cursorrules guidelines
Dùng theme colors từ theme/colors.ts
TypeScript strict mode
Reanimated cho animations
i18n cho text
React Query cho API
```

### ✅ Reference Existing
```
Tương tự như @LoginScreen.tsx
Follow structure của @OrderCard.tsx
Theo style của existing components
```

---

## 🚀 Quick Command Templates

### Copy-Paste Ready Commands

#### Button
```
Tạo PrimaryButton với variants (primary, secondary, outline), loading state, disabled state, icon support, ripple animation, theme colors, TypeScript props
```

#### Card
```
Tạo OrderCard hiển thị order number, table, status badge, items count, total, action buttons, swipe actions, animation, theme colors theo status
```

#### Screen
```
Tạo OrderListScreen với search, filter tabs, FlatList optimized, pull-to-refresh, load more, empty/error states, FAB, React Query, navigation typed
```

#### Form
```
Tạo TextInput với label, error state, icons, validation, clear button, focus animation, keyboard handling, theme colors, TypeScript types
```

#### Modal
```
Tạo BottomSheet với draggable handle, snap points, backdrop dismiss, keyboard aware, animated open/close, theme colors
```

---

## 📚 Kết Luận

File này chứa **200+ UI commands** covering toàn bộ UI development cho BeBienManager!

### Next Steps:
1. ✅ Bookmark file này
2. ✅ Copy command cần dùng
3. ✅ Paste vào Cursor (⌘ + I)
4. ✅ Customize nếu cần
5. ✅ Review code generated
6. ✅ Refine và optimize

**Happy UI Coding!** 🎨🚀

---

_Last updated: March 7, 2026_
_Version: 1.0.0_
