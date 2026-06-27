<script setup lang="ts">
import { Input } from "~/components/ui/input";
import { cn } from "@/lib/utils";

defineProps<{
  label: string;
  modelValue?: number | string;
  type?: "text" | "number";
  step?: number;
  min?: number;
  max?: number;
  width?: "full" | "half";
}>();

defineEmits<{
  "update:modelValue": [value: number | string];
}>();
</script>

<template>
  <div :class="width === 'half' ? 'space-y-0.5' : 'space-y-0.5'">
    <label
      class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
    >
      {{ label }}
    </label>
    <Input
      :type="type ?? 'text'"
      :step="step"
      :min="min"
      :max="max"
      :model-value="String(modelValue ?? '')"
      :class="
        cn(
          'h-6 w-full px-1.5 text-[11px] tabular-nums',
          'bg-[var(--bg-input)] border-[var(--border-panel)] text-[var(--text-primary)]',
          'rounded-[2px] focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]',
        )
      "
      @update:model-value="
        (v: string | number) =>
          $emit('update:modelValue', type === 'number' ? Number(v) : v)
      "
    />
  </div>
</template>
