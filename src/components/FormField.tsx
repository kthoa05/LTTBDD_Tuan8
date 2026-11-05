import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius } from "../theme";

interface Props extends TextInputProps {
  label: string;
  error?: string | null; // có lỗi → viền đỏ + dòng báo lỗi NGAY DƯỚI ô nhập
  right?: React.ReactNode; // nút phụ đặt cạnh ô nhập (ví dụ nút 👁 hiện/ẩn mật khẩu)
}

export function FormField({ label, error, right, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputGrow, error ? styles.inputError : null, style]}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          {...rest}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: { fontWeight: "700", color: colors.text },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputGrow: { flex: 1 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});
