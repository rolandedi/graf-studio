<script setup lang="ts">
import type { Component } from "vue";
import { cn } from "@/lib/utils";

interface Props {
  icon: Component;
  label: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [];
}>();

function onClick() {
  if (props.disabled) return;
  emit("click");
}
</script>

<template>
  <button
    type="button"
    :title="title ?? label"
    :disabled="disabled"
    :class="
      cn(
        'flex h-9 items-center gap-1.5 px-2.5 text-[11px] font-medium',
        'transition-colors select-none',
        'border-b-2 border-transparent',
        active && 'text-(--accent-orange) border-b-(--accent-orange)',
        !active && !disabled && 'text-(--text-primary) hover:bg-(--bg-panel-2)',
        disabled && 'text-(--text-muted) opacity-60 cursor-not-allowed',
      )
    "
    @click="onClick"
  >
    <component :is="icon" class="size-4 shrink-0" />
    <span class="leading-none whitespace-nowrap">{{ label }}</span>
  </button>
</template>
