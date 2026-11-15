import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Select. Options are `{ label, value }` objects — do not pass children
 * as options. The trigger carries `aria-label` from `label` (or the
 * placeholder) so its state is exposed to assistive tech.
 */
export function Select({
  options,
  value,
  onValueChange,
  placeholder,
  label,
  disabled,
}: SelectProps) {
  // Items carry the whole `{ label, value }` option object, so the trigger
  // can show the selected label without the list ever having opened
  // (Base UI resolves an object-valued item's label automatically).
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <span className="text-sm font-medium text-text">{label}</span>
      ) : null}
      <BaseSelect.Root
        value={selectedOption}
        onValueChange={(nextValue) => {
          const option = nextValue as SelectOption | null;
          if (option) {
            onValueChange(option.value);
          }
        }}
        disabled={disabled}
      >
        <BaseSelect.Trigger
          aria-label={label ?? placeholder ?? "Select an option"}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-rounded border border-border bg-surface px-3 text-sm text-text transition-colors duration-fast hover:border-border-strong focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 data-[placeholder]:text-text-muted"
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon>
            <ChevronDown className="size-4 text-text-muted" aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className="z-50">
            <BaseSelect.Popup className="w-[var(--anchor-width)] rounded-rounded border border-border bg-surface-raised p-1 text-sm text-text">
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option}
                  className="flex cursor-default items-center justify-between gap-2 rounded-rounded px-3 py-2 transition-colors duration-fast hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus data-[selected]:bg-surface"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check className="size-4 text-brand" aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}
