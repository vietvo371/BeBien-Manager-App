# 🧪 Test Cursor AI Configuration

## ✅ Checklist - Files Đã Tạo

- [x] `.cursorrules` - Main configuration file
- [x] `.cursorrules-guide.md` - Detailed usage guide
- [x] `CURSOR_SETUP.md` - Quick start guide
- [x] `CURSOR_TEST.md` - This file
- [x] `.templates/Component.template.tsx` - Component template
- [x] `.templates/Screen.template.tsx` - Screen template

## 🧪 Test Cases - Kiểm Tra Cursor Hoạt Động

### Test 1: Simple Component Creation
**Mục đích**: Kiểm tra Cursor có tạo component theo standards không

**Command** (⌘ + I):
```
Tạo Button component với:
- Primary và Secondary variants
- Loading state
- Disabled state
- onPress callback
- Dùng theme colors và Reanimated animation
```

**Expected Result**:
- ✅ File tạo tại đúng folder `src/components/Button.tsx`
- ✅ TypeScript types được define đầy đủ
- ✅ Sử dụng colors từ `theme/colors.ts`
- ✅ Có animation với Reanimated
- ✅ StyleSheet.create() được dùng
- ✅ Export đúng format

### Test 2: Screen với API Integration
**Mục đích**: Kiểm tra Cursor hiểu workflow và tech stack

**Command** (⌘ + I):
```
Tạo OrderListScreen với:
- Fetch orders từ API dùng React Query
- FlatList với pull-to-refresh
- Search functionality
- Navigate to OrderDetailScreen khi tap item
- Loading và error states
- Follow screen template
```

**Expected Result**:
- ✅ Sử dụng React Query (useQuery)
- ✅ FlatList với performance optimizations
- ✅ SafeAreaView wrapper
- ✅ RefreshControl implementation
- ✅ Type-safe navigation
- ✅ Error handling với ErrorMessage component
- ✅ i18n translations thay vì hardcoded text

### Test 3: Service Creation
**Mục đích**: Kiểm tra Cursor tạo service với best practices

**Command** (⌘ + I):
```
Tạo orderService với:
- CRUD operations cho orders
- Axios instance với interceptor
- Error handling
- TypeScript types
- React Query integration ready
```

**Expected Result**:
- ✅ File tại `src/services/orderService.ts`
- ✅ Axios instance config
- ✅ Token interceptor
- ✅ Error handling với try-catch
- ✅ Types được define trong `src/types/order-api.types.ts`
- ✅ Export functions cho React Query

### Test 4: Zustand Store
**Mục đích**: Kiểm tra Cursor tạo store theo chuẩn

**Command** (⌘ + I):
```
Tạo orderStore với Zustand:
- State: orders, selectedOrder, filters
- Actions: setOrders, selectOrder, updateFilter
- Persist với AsyncStorage
- TypeScript types
```

**Expected Result**:
- ✅ File tại `src/stores/orderStore.ts`
- ✅ Sử dụng zustand/middleware persist
- ✅ AsyncStorage integration
- ✅ TypeScript interface cho state
- ✅ Immutable updates
- ✅ Proper exports

### Test 5: Feature Implementation (Complex)
**Mục đích**: Kiểm tra Cursor implement workflow phức tạp

**Command** (⌘ + I):
```
Implement order cancellation flow theo .cursorrules:
1. Kitchen staff cancel order
2. Send to server for pending approval
3. Manager receives notification
4. Manager can approve/reject
5. Notify Cashier (only is_master = 0) when approved

Tạo đầy đủ:
- UI components
- Services
- Socket handlers
- Notifications
```

**Expected Result**:
- ✅ Multiple files created (components, services, hooks)
- ✅ Follow workflow trong .cursorrules
- ✅ Role-based logic (is_master check)
- ✅ Socket/FCM integration
- ✅ Error handling ở mọi bước
- ✅ TypeScript types đầy đủ

### Test 6: Code Refactoring
**Mục đích**: Kiểm tra Cursor optimize existing code

**Command** (Select LoginScreen → ⌘ + K):
```
Refactor LoginScreen:
- Extract form logic to useLoginForm hook
- Optimize re-renders với React.memo và useCallback
- Add biometric authentication
- Improve error handling
- Follow coding standards
```

**Expected Result**:
- ✅ Custom hook `useLoginForm` được tạo
- ✅ React.memo được áp dụng đúng chỗ
- ✅ useCallback cho event handlers
- ✅ Biometric logic được thêm
- ✅ Error states được improve
- ✅ Code structure clean hơn

### Test 7: TypeScript & Type Safety
**Mục đích**: Kiểm tra Cursor handle TypeScript properly

**Command** (⌘ + I):
```
Tạo types cho Order system:
- Order interface với all fields
- OrderStatus enum
- API request/response types
- Navigation params types
Export tất cả từ order.types.ts
```

**Expected Result**:
- ✅ File tại `src/types/order.types.ts`
- ✅ Interface complete với JSDoc comments
- ✅ Enum cho status
- ✅ Generic types cho API
- ✅ Không có `any` type
- ✅ Export organization tốt

### Test 8: i18n Integration
**Mục đích**: Kiểm tra Cursor dùng i18n

**Command** (⌘ + K on component với hardcoded text):
```
Convert tất cả hardcoded text sang i18n translations
```

**Expected Result**:
- ✅ `useTranslation()` hook được add
- ✅ Tất cả text được wrap trong `t()`
- ✅ Translation keys có naming convention tốt
- ✅ Suggest tạo translation files nếu chưa có

## 📊 Scoring System

Mỗi test case:
- ✅ **Pass (100%)**: Tất cả expected results đạt được
- ⚠️ **Partial (50-99%)**: Một số expected results bị thiếu
- ❌ **Fail (<50%)**: Không follow rules, nhiều issues

**Target**: 80% overall pass rate

## 🐛 Common Issues & Solutions

### Issue 1: Cursor không follow .cursorrules
**Solution**:
1. Reload Cursor (⌘ + R)
2. Close và reopen project
3. Explicitly mention: "Follow .cursorrules guidelines"
4. Check .cursorrules syntax không có lỗi

### Issue 2: Tạo file sai vị trí
**Solution**:
- Specify rõ path: "Tạo Button.tsx trong src/components/"
- Reference existing structure: "Theo structure của @LoginScreen"

### Issue 3: Không dùng theme colors
**Solution**:
- Mention trong command: "Dùng colors từ theme/colors.ts"
- Add: "Follow styling guidelines trong .cursorrules"

### Issue 4: Thiếu TypeScript types
**Solution**:
- Add vào command: "With proper TypeScript types"
- "Follow TypeScript strict mode rules"

### Issue 5: Hardcoded strings
**Solution**:
- "Use i18n translations for all text"
- "No hardcoded strings"

## 🎯 Real-World Test Scenario

### Scenario: Implement Complete Order Approval Feature

**Step 1**: Plan với Chat (⌘ + L)
```
Explain làm thế nào để implement order approval feature với:
- Pending orders list cho Manager
- Approve/Reject buttons
- Socket notification to Cashier
- Update order status
Follow .cursorrules workflow
```

**Step 2**: Implement với Composer (⌘ + I)
```
Based on the plan, implement order approval feature:

1. Create PendingOrdersScreen for Manager
2. Create pendingOrderService with API calls
3. Create socket handler for real-time updates
4. Create notification handler for Cashier (is_master = 0 only)
5. Add to navigation
6. Create all necessary types

Follow all coding standards and best practices in .cursorrules
```

**Step 3**: Review & Refine
```
Review the implementation:
- Check for performance issues
- Verify TypeScript types
- Test error scenarios
- Add loading states if missing
- Optimize re-renders
```

**Expected Outcome**:
- Complete feature với 10-15 files created/modified
- All files follow standards
- Type-safe throughout
- Error handling complete
- Performance optimized
- Ready for production

## 📝 Test Log Template

Dùng template này để track test results:

```markdown
## Test Date: [DATE]

### Test 1: Simple Component Creation
- Status: ✅ Pass / ⚠️ Partial / ❌ Fail
- Score: __/100
- Notes: ...

### Test 2: Screen với API Integration  
- Status: ✅ Pass / ⚠️ Partial / ❌ Fail
- Score: __/100
- Notes: ...

[Continue for all tests...]

### Overall Score: __/100
### Comments:
...

### Improvements Needed:
- [ ] Item 1
- [ ] Item 2
```

## 🎓 Learning & Iteration

Sau mỗi lần test:
1. **Document issues** gặp phải
2. **Update .cursorrules** nếu cần thêm guidelines
3. **Refine commands** để rõ ràng hơn
4. **Share findings** với team

## ✨ Success Indicators

Cursor AI configuration considered **successful** khi:
- ✅ 80%+ test cases pass
- ✅ Generated code không cần major refactoring
- ✅ TypeScript errors minimal
- ✅ Follow project conventions consistently
- ✅ Code review ready
- ✅ Save development time significantly

---

**Ready to test?** Start with Test 1 và work your way through! 🚀

Good luck! 🎉
