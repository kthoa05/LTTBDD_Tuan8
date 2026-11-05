import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";

import { EmptyState } from "../components/EmptyState";
import { useAuth, useCart } from "../store/hooks";
import { confirmDialog } from "../utils/dialog"; // đã viết sẵn — dùng ở BT8.7a
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice, radius } from "../theme";

// Hai mã cố định ở phía client (BT8.C2)
const COUPONS: Record<string, { label: string; discount: (subtotal: number) => number }> = {
  SALE10: { label: "Giảm 10%", discount: (s) => Math.round(s * 0.1) },
  GIAM50K: { label: "Giảm 50.000đ", discount: (s) => Math.min(50000, s) },
};

export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth();

  // TODO BT8.C2 (thử thách): trừ mã giảm giá → finalTotal = totalPrice - discount
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const discount = coupon ? COUPONS[coupon].discount(totalPrice) : 0;
  const finalTotal = totalPrice - discount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(COUPONS, code)) {
      setCoupon(code);
      setCouponMsg({ text: `Đã áp dụng ${code}: ${COUPONS[code].label}`, ok: true });
    } else {
      setCoupon(null);
      setCouponMsg({ text: "Mã giảm giá không hợp lệ", ok: false });
    }
  };

  // TODO BT8.7a: xóa sản phẩm có XÁC NHẬN — dùng confirmDialog(title, message, onConfirm) đã viết sẵn ở utils/dialog.ts
  //   (Alert.alert không chạy trên web nên đã bọc sẵn). Hiện tại xóa ngay không hỏi.
  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);
    confirmDialog("Xóa sản phẩm", `Xóa "${item?.title ?? "sản phẩm"}" khỏi giỏ hàng?`, () => remove(bookId));
  };

  // TODO BT8.4: bảo vệ Checkout — nếu isLoggedIn → navigate("Checkout", { total: finalTotal })
  //   chưa đăng nhập → navigate("Login", { redirectTo: "Checkout", total: finalTotal })
  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", { redirectTo: "Checkout", total: finalTotal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="Giỏ hàng trống" message="Hãy chọn vài cuốn sách yêu thích nhé." actionLabel="Khám phá sách" onAction={() => navigation.navigate("Home")} />
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              value={couponInput}
              onChangeText={setCouponInput}
              placeholder="Mã giảm giá (SALE10)"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
            />
            <Pressable style={styles.couponBtn} onPress={applyCoupon}>
              <Text style={styles.couponBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
          {couponMsg ? <Text style={[styles.couponMsg, { color: couponMsg.ok ? colors.success : colors.danger }]}>{couponMsg.text}</Text> : null}

          <View style={styles.line}><Text style={styles.muted}>Tạm tính</Text><Text style={styles.value}>{formatPrice(totalPrice)}</Text></View>
          {discount > 0 && (
            <View style={styles.line}><Text style={styles.muted}>Giảm giá</Text><Text style={styles.discount}>-{formatPrice(discount)}</Text></View>
          )}
          <View style={styles.line}><Text style={styles.total}>Tổng cộng</Text><Text style={styles.total}>{formatPrice(finalTotal)}</Text></View>
          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  couponRow: { flexDirection: "row", gap: 8 },
  couponInput: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, color: colors.text },
  couponBtn: { backgroundColor: colors.indigo, paddingHorizontal: 14, borderRadius: radius.md, justifyContent: "center" },
  couponBtnText: { color: "#fff", fontWeight: "800" },
  couponMsg: { fontSize: 12 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  discount: { fontWeight: "700", color: colors.success },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
});
