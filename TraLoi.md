# Trả lời câu hỏi bổ sung — Buổi 8

## 1. Cờ `ready` trong `useAutoPersist`

Nếu bỏ điều kiện `ready`, hook sẽ ghi ngay ở lần render đầu. Lúc đó store giỏ hàng còn rỗng nên `saveJSON` ghi `[]` đè lên dữ liệu đã lưu. Trong khi đó `usePersistence` đọc AsyncStorage bất đồng bộ, nên có thể đọc được `[]` hoặc đọc sau khi đã bị ghi đè. Kết quả là mở lại app thì giỏ hàng trống.

Với `ready`, hook chỉ ghi sau khi `usePersistence` đã đọc xong và gọi `setReady(true)`. Khi đó store đã có dữ liệu cũ nên ghi lại đúng.

## 2. Token giả

Hai điểm không an toàn:
- Mật khẩu được lưu thẳng trong `db.json` và được so sánh ở phía app. Ai xem được app đều có thể đọc mật khẩu.
- Token chỉ là chuỗi `token-<id>-<thời gian>`, ai cũng tự tạo được.

Hệ thống thật thì server kiểm tra mật khẩu đã băm (ví dụ bcrypt), rồi cấp token có thời hạn (ví dụ JWT kèm refresh token). Token nên lưu bằng SecureStore (Keychain trên iOS, Keystore trên Android), không lưu dạng thô trong AsyncStorage.

## 3. Hai effect trong `CartItemRow`

Nếu xóa effect `setQty(item.quantity)` thì số trên nút sẽ lệch với store khi store đổi từ nơi khác. Ví dụ: giỏ đang hiện số 2, sau đó giỏ được nạp lại từ AsyncStorage hoặc sản phẩm bị xóa rồi thêm lại. Store đã là 1 hoặc 3, nhưng `qty` cục bộ vẫn giữ giá trị cũ là 2, nên nút hiển thị sai.

## 4. Một nguồn state

Nếu `HeartButton` giữ trạng thái bằng `useState` riêng ở mỗi nơi thì tim ở lưới sách và tim ở trang chi tiết là hai trạng thái độc lập. Bấm tim ở lưới thì trang chi tiết vẫn trắng. Khi dùng store, cả hai cùng đọc một danh sách `ids`, nên khi một nơi thay đổi thì mọi nơi đều cập nhật theo.

## 5. Hiện/ẩn mật khẩu

Thêm một state điều khiển `secureTextEntry`:

```tsx
const [showPassword, setShowPassword] = useState(false);

<FormField
  label="Mật khẩu"
  value={password}
  onChangeText={setPassword}
  error={errors.password}
  secureTextEntry={!showPassword}
/>
<Pressable onPress={() => setShowPassword((v) => !v)} accessibilityLabel="Hiện hoặc ẩn mật khẩu">
  <Text>{showPassword ? "🙈" : "👁"}</Text>
</Pressable>
```

Ảnh chụp màn hình kết quả: chụp màn Đăng nhập khi mật khẩu đang hiện và khi đang ẩn.
