# EmptyState Component

Reusable empty state component với Rafiki-style illustrations.

## Usage Examples

### 1. Basic Usage
```tsx
import EmptyState from '../component/EmptyState';

// No data
<EmptyState type="no-data" />

// No search results
<EmptyState type="search" />

// Error state
<EmptyState type="error" />

// Network error
<EmptyState type="network" />
```

### 2. Custom Messages
```tsx
<EmptyState
  type="no-data"
  title="Chưa có bài tập"
  description="Bạn chưa có bài tập nào. Hãy kiểm tra lại sau!"
/>
```

### 3. With Action Button
```tsx
<EmptyState
  type="error"
  title="Tải dữ liệu thất bại"
  description="Không thể kết nối đến máy chủ"
  actionLabel="Thử lại"
  onAction={() => refetch()}
/>
```

### 4. Custom Icon
```tsx
<EmptyState
  icon="calendar-remove"
  iconColor="#F59E0B"
  title="Không có lịch học"
  description="Bạn chưa được xếp lịch học"
/>
```

### 5. Custom Illustration
```tsx
<EmptyState
  illustration={require('../assets/custom-empty.png')}
  title="Custom Empty State"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `'no-data'` \| `'search'` \| `'error'` \| `'network'` | `'no-data'` | Preset empty state type |
| title | `string` | Auto from type | Main title text |
| description | `string` | Auto from type | Description text |
| icon | `string` | Auto from type | MaterialCommunityIcons name |
| iconColor | `string` | Auto from type | Icon color |
| illustration | `ImageSourcePropType` | Auto from type | Custom illustration image |
| actionLabel | `string` | `undefined` | Action button label |
| onAction | `() => void` | `undefined` | Action button handler |
| style | `ViewStyle` | `undefined` | Container style override |

## Type Presets

### `'no-data'`
- Title: "Chưa có dữ liệu"
- Description: "Hiện tại chưa có dữ liệu để hiển thị"
- Icon: inbox
- Color: Gray

### `'search'`
- Title: "Không tìm thấy kết quả"
- Description: "Hãy thử tìm kiếm với từ khóa khác"
- Icon: magnify
- Color: Blue

### `'error'`
- Title: "Có lỗi xảy ra"
- Description: "Vui lòng thử lại sau"
- Icon: alert-circle
- Color: Red

### `'network'`
- Title: "Không có kết nối"
- Description: "Vui lòng kiểm tra kết nối mạng"
- Icon: wifi-off
- Color: Orange

## Integration Examples

### In FlatList
```tsx
<FlatList
  data={data}
  renderItem={renderItem}
  ListEmptyComponent={
    <EmptyState
      type="no-data"
      title="Chưa có khóa học"
      description="Bạn chưa đăng ký khóa học nào"
    />
  }
/>
```

### With Loading State
```tsx
{isLoading ? (
  <ActivityIndicator />
) : error ? (
  <EmptyState
    type="error"
    actionLabel="Thử lại"
    onAction={() => refetch()}
  />
) : data.length === 0 ? (
  <EmptyState type="no-data" />
) : (
  <DataList data={data} />
)}
```

### In Search
```tsx
{searchText && filteredData.length === 0 && (
  <EmptyState
    type="search"
    description={`Không tìm thấy "${searchText}"`}
    actionLabel="Xóa tìm kiếm"
    onAction={() => setSearchText('')}
  />
)}
```
