<script setup lang="ts">
import { ChevronDown, ChevronRight } from "@lucide/vue";
import { useUiStore } from "~/composables/useUiStore";
import { cn } from "@/lib/utils";

const props = defineProps<{
  id: string;
  title: string;
  modified?: boolean;
  defaultOpen?: boolean;
}>();

const { expandedSections, toggleSection } = useUiStore();

// Default open for sections marked defaultOpen (and not yet seen)
if (
  props.defaultOpen &&
  !expandedSections.value.has(props.id) &&
  expandedSections.value.size === 0
) {
  expandedSections.value.add(props.id);
}

const isOpen = computed(() => expandedSections.value.has(props.id));
</script>

<template>
  <div class="border-b border-[var(--border-subtle)]">
    <button
      type="button"
      class="resolve-section-header w-full"
      @click="toggleSection(id)"
    >
      <div class="flex items-center gap-2">
        <span v-if="modified" class="resolve-dot" aria-label="Modified" />
        <span class="text-[11px] font-medium tracking-wide">{{ title }}</span>
      </div>
      <component
        :is="isOpen ? ChevronDown : ChevronRight"
        :class="cn('size-3.5 text-[var(--text-secondary)]')"
      />
    </button>
    <div v-if="isOpen" class="px-2 py-2 space-y-1.5">
      <slot />
    </div>
  </div>
</template>
