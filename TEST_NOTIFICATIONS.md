# 🧪 Test Push Notifications - Troubleshooting

## ✅ Đã fix

1. ✅ Background message handler trong `index.js`
2. ✅ AppDelegate với UNUserNotificationCenter delegate
3. ✅ Entitlements có `aps-environment`
4. ✅ Background Modes enabled

---

## ⚠️ iOS Simulator Limitations

**QUAN TRỌNG**: iOS Simulator **KHÔNG hỗ trợ** remote push notifications!

### Simulator Support:
- ✅ **Local notifications** (Notifee) - Work
- ❌ **Remote push** (FCM) - **KHÔNG work**

### Device Support:
- ✅ **Local notifications** - Work
- ✅ **Remote push** (FCM) - Work

**Kết luận**: Phải test trên **device thật** để thấy background notifications!

---

## 📱 Test trên Device Thật

### Bước 1: Connect iPhone/iPad

```bash
# Chọn device thật trong Xcode
# Hoặc chạy từ terminal:
yarn ios --device "iPhone của Bạn"
```

### Bước 2: Copy FCM Token

Khi app chạy, check console:

```
═══════════════════════════════════════════════
🎯 FCM TOKEN (Copy để test notification):
dXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
═══════════════════════════════════════════════
```

### Bước 3: Gửi Test Notification

**Firebase Console**:
1. https://console.firebase.google.com/
2. Cloud Messaging → **Send your first message**
3. **Notification title**: Test
4. **Notification text**: Hello from background
5. Next → **Send test message**
6. **Paste FCM token** → Test

### Bước 4: Minimize App

- Nhấn **Home button** (minimize app)
- Hoặc **quit app** hoàn toàn (swipe up)

### Bước 5: Gửi Notification

Click **Test** trong Firebase Console

---

## 🎯 Expected Behavior

### Test Case 1: App Foreground (đang mở)
✅ **Notification banner** xuất hiện ở top  
✅ **Sound** phát ra  
✅ **Console log** message  
✅ **Order list refresh** tự động

### Test Case 2: App Background (minimize)
✅ **System notification** xuất hiện trong notification center  
✅ **Sound** phát ra  
✅ **Tap notification** → App mở + refresh orders

### Test Case 3: App Quit (đóng hoàn toàn)
✅ **System notification** xuất hiện  
✅ **Tap notification** → Launch app + navigate to screen

---

## 🐛 Troubleshooting

### Không thấy notification khi background

**Check 1: Đang test trên simulator?**
```bash
# Check device type
xcrun simctl list devices | grep Booted
```

Nếu thấy "Booted" → Đang dùng simulator → **KHÔNG support remote push!**

**Giải pháp**: Chạy trên device thật!

---

**Check 2: APNs Key chưa setup trong Firebase?**

iOS production cần **APNs authentication key** trong Firebase Console:

1. Vào https://console.firebase.google.com/
2. Project settings → Cloud Messaging
3. Tab **Apple app configuration**
4. Xem có **APNs Authentication Key** hoặc **APNs Certificates** chưa?

**Nếu chưa có**:
1. Vào Apple Developer: https://developer.apple.com/account/resources/authkeys/list
2. Tạo **APNs Authentication Key**
3. Download `.p8` file
4. Upload vào Firebase Console

**Note**: Development mode có thể không cần APNs key (dùng sandbox), nhưng production cần!

---

**Check 3: GoogleService-Info.plist có đúng không?**

```bash
cat ios/BeBienManager/GoogleService-Info.plist | grep GOOGLE_APP_ID
```

Nếu thấy **PLACEHOLDER** → Cần download file đúng từ Firebase Console.

---

**Check 4: Notification permission granted?**

Mở **Settings** → **BeBienManager** → **Notifications**
- ✅ Allow Notifications: **ON**
- ✅ Sounds: ON
- ✅ Badges: ON
- ✅ Banners: ON

---

**Check 5: Background Modes enabled trong Xcode?**

1. Mở Xcode: `open ios/BeBienManager.xcworkspace`
2. Target BeBienManager → Signing & Capabilities
3. Xem có **Background Modes** với:
   - ✅ Remote notifications

---

## 🔍 Debug Steps

### Step 1: Verify App State

Khi minimize app, check console:

```
📱 App state changed: active → background
```

Nếu không thấy → Background modes chưa work.

### Step 2: Verify FCM Token

Console phải show:

```
🎯 FCM TOKEN (Copy để test notification):
[token_here]
```

Copy token này để test.

### Step 3: Test với cURL (chi tiết hơn)

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test Background",
      "body": "This should appear when app is minimized"
    },
    "data": {
      "type": "order_created",
      "order_id": "123"
    },
    "priority": "high"
  }'
```

**Note**: Cần `YOUR_SERVER_KEY` từ Firebase Console → Project settings → Cloud Messaging → Server key

---

## 📋 Quick Checklist

### iOS Configuration:
- [x] `aps-environment` in entitlements ✅
- [x] `UIBackgroundModes` with `remote-notification` ✅
- [x] UNUserNotificationCenter delegate in AppDelegate ✅
- [x] Background handler in index.js ✅
- [ ] **Running on real device?** (NOT simulator)
- [ ] **APNs key uploaded to Firebase?** (for production)
- [ ] **Notification permission granted?** (Settings → App → Notifications)

### Testing:
- [ ] Test on **real device** (iPhone/iPad)
- [ ] App is **minimized** (background state)
- [ ] Send notification from Firebase Console
- [ ] Check notification center

---

## 🎯 Most Common Issues

### 1. Testing on Simulator
**Problem**: Simulator doesn't support remote push.  
**Solution**: Use real device.

### 2. APNs Not Configured
**Problem**: Firebase can't send to iOS devices.  
**Solution**: Upload APNs key to Firebase Console.

### 3. App Not Actually in Background
**Problem**: App in foreground, expecting background notification.  
**Solution**: Press Home button to minimize app first.

### 4. Wrong Token
**Problem**: Using old/invalid FCM token.  
**Solution**: Get fresh token from console log.

---

## 🚀 Rebuild & Test

```bash
# Rebuild app
yarn ios

# Or run on specific device
yarn ios --device "iPhone 14"

# Then:
1. Open app
2. Copy FCM token from console
3. Minimize app (Home button)
4. Send notification from Firebase Console
5. Check if system notification appears
```

---

**Expected**: System notification xuất hiện khi app ở background! 🔔
