# 🔧 Fix Background Notifications không hiện

## ✅ So sánh với LMS_APP

Tôi đã đọc LMS_APP và BeBienManager **ĐÃ TỐT HƠN**:

| Feature | LMS_APP | BeBienManager | Status |
|---------|---------|---------------|--------|
| Firebase API | Deprecated namespaced | ✅ Modular API (v22+) | ✅ Better |
| `index.js` | `messaging()` | ✅ `getMessaging(getApp())` | ✅ Better |
| `AppDelegate.swift` | `[[.banner, .sound]]` | ✅ `[.banner, .sound, .badge]` | ✅ Better |
| Background handler | ✅ Có | ✅ Có | ✅ Same |
| NotificationService | ✅ Component | ✅ Component | ✅ Same |

**Kết luận**: Code của BeBienManager đã ĐÚNG và TỐT HƠN LMS_APP!

---

## 🎯 3 Nguyên nhân chính không thấy notification

### 1. **Đang test trên iOS Simulator** ⚠️

**iOS Simulator KHÔNG HỖ TRỢ remote push notifications!**

```bash
# Check xem đang chạy simulator hay device:
xcrun simctl list devices | grep Booted
```

**Nếu thấy output** → Đang dùng simulator → **PHẢI test trên device thật!**

**Giải pháp**:
```bash
# Connect iPhone/iPad và chạy:
yarn ios --device "iPhone 15 của Bạn"

# Hoặc trong Xcode:
# 1. Connect device
# 2. Select device từ dropdown
# 3. Cmd + R
```

---

### 2. **APNs Key chưa được setup trong Firebase** 🔑

iOS cần **APNs Authentication Key** để Firebase có thể gửi push notifications.

**Check trong Firebase Console**:
1. Vào https://console.firebase.google.com/
2. Project settings → Cloud Messaging → Tab **Apple**
3. Xem có **APNs Authentication Key** chưa?

**Nếu chưa có** → Làm theo các bước sau:

#### Bước 1: Tạo APNs Key trong Apple Developer

1. Vào https://developer.apple.com/account/resources/authkeys/list
2. Click **+** (Create a Key)
3. **Key Name**: `BeBienManager APNs Key`
4. ✅ Check **Apple Push Notifications service (APNs)**
5. Click **Continue** → **Register** → **Download** (file `.p8`)

**⚠️ QUAN TRỌNG**: 
- Lưu file `.p8` cẩn thận (chỉ download được 1 lần!)
- Ghi lại **Key ID** (10 ký tự, ví dụ: `AB12CD34EF`)
- Ghi lại **Team ID** (ở góc trên bên phải, ví dụ: `XYZ123ABC4`)

#### Bước 2: Upload lên Firebase Console

1. Vào Firebase Console → Project settings → Cloud Messaging
2. Tab **Apple app configuration**
3. Click **Upload** trong section **APNs Authentication Key**
4. Điền:
   - **Upload .p8 file**: Chọn file `.p8` vừa download
   - **Key ID**: Paste Key ID (10 ký tự)
   - **Team ID**: Paste Team ID
5. Click **Upload**

**Sau khi upload** → Background notifications sẽ work! 🎉

---

### 3. **Notification Permission chưa được granted** 📱

#### Check permission trên device:

```
Settings → BeBienManager → Notifications
```

Phải bật:
- ✅ **Allow Notifications**: ON
- ✅ **Sounds**: ON  
- ✅ **Badges**: ON
- ✅ **Banners**: ON

Nếu OFF → App sẽ không nhận background notifications!

---

## 🧪 Test đúng cách

### Step 1: Chạy trên device thật

```bash
yarn ios --device "iPhone của bạn"
```

### Step 2: Copy FCM Token

Mở app, check console log:

```
═══════════════════════════════════════════════
🎯 FCM TOKEN (Copy để test notification):
d...XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
═══════════════════════════════════════════════
```

Copy token này!

### Step 3: Minimize app

- Nhấn **Home button** (hoặc swipe up)
- App phải ở **background** hoặc **quit state**
- **KHÔNG để foreground!**

### Step 4: Gửi test notification từ Firebase Console

1. Vào https://console.firebase.google.com/
2. **Messaging** (menu bên trái)
3. Click **Create your first campaign** hoặc **New campaign**
4. Chọn **Firebase Notification messages**
5. Điền:
   - **Notification title**: `Test Background`
   - **Notification text**: `This should appear!`
6. Click **Send test message**
7. Paste **FCM token** vừa copy
8. Click **Test**

### Step 5: Kiểm tra notification

- System notification phải xuất hiện trên device! 🔔
- Tap notification → App mở
- Check console log:

```
📱 Notification opened app from background: {...}
```

---

## 🐛 Troubleshooting chi tiết

### ❌ Vẫn không thấy notification

**Check 1: Device có internet không?**
```bash
# Ping Firebase server từ device
ping fcm.googleapis.com
```

**Check 2: Bundle ID có đúng không?**

```bash
# Check Bundle ID trong project:
cat ios/BeBienManager.xcodeproj/project.pbxproj | grep PRODUCT_BUNDLE_IDENTIFIER

# Check Bundle ID trong GoogleService-Info.plist:
cat ios/BeBienManager/GoogleService-Info.plist | grep BUNDLE_ID
```

Phải **KHỚP NHAU**! Nếu khác nhau → Download lại `GoogleService-Info.plist` từ Firebase Console.

**Check 3: APNs environment có đúng không?**

```bash
cat ios/BeBienManager/BeBienManager.entitlements
```

Phải thấy:
```xml
<key>aps-environment</key>
<string>development</string>
```

**Check 4: Background Modes có enable không?**

```bash
cat ios/BeBienManager/Info.plist | grep -A 5 UIBackgroundModes
```

Phải thấy:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

**Check 5: Test với cURL (bypass Firebase Console)**

```bash
# Lấy Server Key từ Firebase Console → Project settings → Cloud Messaging
export FCM_SERVER_KEY="YOUR_SERVER_KEY_HERE"
export FCM_TOKEN="YOUR_DEVICE_TOKEN_HERE"

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$FCM_TOKEN\",
    \"notification\": {
      \"title\": \"Test từ cURL\",
      \"body\": \"Nếu thấy message này thì Firebase hoạt động!\"
    },
    \"data\": {
      \"type\": \"test\",
      \"timestamp\": \"$(date +%s)\"
    },
    \"priority\": \"high\"
  }"
```

Nếu cURL work → Vấn đề ở Firebase Console settings.  
Nếu cURL không work → Vấn đề ở APNs key hoặc device config.

---

## 📋 Final Checklist

Trước khi báo lỗi, check toàn bộ:

### iOS Native Config:
- [x] Xcode: Push Notifications capability enabled
- [x] Xcode: Background Modes → Remote notifications enabled
- [x] `BeBienManager.entitlements` có `aps-environment`
- [x] `Info.plist` có `UIBackgroundModes` với `remote-notification`
- [x] `GoogleService-Info.plist` có đúng Bundle ID

### Firebase Config:
- [ ] **APNs Authentication Key uploaded** ← **QUAN TRỌNG NHẤT!**
- [ ] Bundle ID trong Firebase Console khớp với Xcode
- [ ] Firebase Cloud Messaging enabled

### Device Config:
- [ ] **Testing on REAL device** (NOT simulator)
- [ ] Notification permission granted (Settings → App → Notifications)
- [ ] Device có internet (Wi-Fi hoặc 4G)
- [ ] iOS version >= 10.0

### Testing:
- [ ] App đã rebuild (`yarn ios`)
- [ ] FCM token đã copy được từ console
- [ ] App đang ở **background** (không foreground!)
- [ ] Đã gửi test notification từ Firebase Console
- [ ] Đã check notification center trên device

---

## 🎯 Most Likely Issue

**95% trường hợp là do:**

1. ✅ **Testing on simulator** → Switch to real device
2. ✅ **APNs key not uploaded** → Upload to Firebase Console (làm theo hướng dẫn ở trên)
3. ⚠️ **App still in foreground** → Minimize app trước khi gửi notification

---

## 🚀 Rebuild & Final Test

```bash
# 1. Clean build
cd ios && pod deintegrate && pod install && cd ..

# 2. Rebuild app trên device
yarn ios --device "iPhone của bạn"

# 3. Copy FCM token từ console

# 4. Minimize app (Home button)

# 5. Firebase Console → Send test message

# 6. Phải thấy system notification! 🔔
```

---

**Expected Result**: System notification xuất hiện khi app ở background! 🎉

**Nếu vẫn không work** → Check xem đã upload APNs Key chưa! Đây là nguyên nhân phổ biến nhất.
