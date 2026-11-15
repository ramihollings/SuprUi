/**
 * Select — Supr UI native, built on `@rn-primitives/select`.
 *
 * The primitive's value is an `{ label, value }` option object; this
 * wrapper keeps the contract's plain-string `value` /
 * `onValueChange(value: string)`. The trigger shows the selected
 * label or the placeholder, with a chevron; the list shows a check on
 * the selected item (colour + icon, never colour alone).
 *
 * Consumers must render `<PortalHost />` (from `@rn-primitives/portal`)
 * once at the app root, or portal content has nowhere to mount.
 */
import { Pressable, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import * as SelectPrimitive from '@rn-primitives/select';
import { fontWeight, useTheme } from '../../theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder,
  label,
  disabled = false,
}: SelectProps) {
  const t = useTheme();
  const selected = options.find((o) => o.value === value);

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
      <SelectPrimitive.Root
        value={selected}
        onValueChange={(option) => onValueChange(option?.value ?? '')}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger asChild>
          <Pressable
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label ?? placeholder ?? 'Select'}
            accessibilityState={{ disabled }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: t.spacing[10],
              paddingHorizontal: t.spacing[3],
              backgroundColor: t.colors.surface,
              borderRadius: t.radii.rounded,
              borderWidth: t.borderWidth.thin,
              borderColor: t.colors.border,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <SelectPrimitive.Value
              placeholder={placeholder ?? 'Select an option'}
              style={{
                flex: 1,
                color: selected ? t.colors.text : t.colors.textMuted,
                fontSize: t.typography.sizes.base.fontSize,
                lineHeight: t.typography.sizes.base.lineHeight,
              }}
            />
            <ChevronDown
              size={t.typography.sizes.base.fontSize}
              color={t.colors.textMuted}
            />
          </Pressable>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Overlay closeOnPress />
          <SelectPrimitive.Content
            style={{
              backgroundColor: t.colors.surfaceRaised,
              borderRadius: t.radii.extraRounded,
              borderWidth: t.borderWidth.thin,
              borderColor: t.colors.border,
              padding: t.spacing[1],
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  closeOnPress
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: t.spacing[2],
                    paddingHorizontal: t.spacing[3],
                    paddingVertical: t.spacing[2],
                    borderRadius: t.radii.rounded,
                    backgroundColor: isSelected
                      ? t.colors.surface
                      : 'transparent',
                  }}
                >
                  <SelectPrimitive.ItemText
                    style={{
                      color: isSelected ? t.colors.text : t.colors.textMuted,
                      fontSize: t.typography.sizes.base.fontSize,
                      lineHeight: t.typography.sizes.base.lineHeight,
                      fontWeight: isSelected
                        ? fontWeight(t, 'medium')
                        : fontWeight(t, 'regular'),
                    }}
                  />
                  <SelectPrimitive.ItemIndicator>
                    <Check
                      size={t.typography.sizes.base.fontSize}
                      color={t.colors.brand}
                    />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </View>
  );
}
