/**
 * Input — Supr UI native.
 *
 * Labelled text field with an error state. `error` renders the error
 * message under the field and switches the border to the danger token;
 * the field stays labelled by `label`. Focus uses the strong border
 * token (the native theme has no `focus` colour — see the tokens
 * README); the border-width change is the visible focus signal.
 */
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { fontWeight, useTheme } from '../../theme';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  size?: InputSize;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  size = 'md',
}: InputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const height =
    size === 'sm' ? t.spacing[8] : size === 'lg' ? t.spacing[12] : t.spacing[10];
  const fontSize =
    size === 'sm' ? t.typography.sizes.sm : t.typography.sizes.base;

  return (
    <View>
      {label ? (
        <Text
          style={{
            color: t.colors.text,
            fontSize: t.typography.sizes.sm.fontSize,
            lineHeight: t.typography.sizes.sm.lineHeight,
            fontWeight: fontWeight(t, 'medium'),
            marginBottom: t.spacing[1],
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textMuted}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled }}
        style={{
          height,
          paddingHorizontal: t.spacing[3],
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          fontSize: fontSize.fontSize,
          lineHeight: fontSize.lineHeight,
          borderRadius: t.radii.rounded,
          borderWidth: t.borderWidth.thin,
          borderColor: error
            ? t.colors.danger
            : focused
              ? t.colors.borderStrong
              : t.colors.border,
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          accessible
          style={{
            color: t.colors.danger,
            fontSize: t.typography.sizes.xs.fontSize,
            lineHeight: t.typography.sizes.xs.lineHeight,
            marginTop: t.spacing[1],
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
