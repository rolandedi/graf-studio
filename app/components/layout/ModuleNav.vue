<script setup lang="ts">
import {
  Film,
  Scissors,
  Edit3,
  Sparkles,
  Palette,
  Sliders,
  Send,
} from "@lucide/vue";
import { computed } from "vue";

interface ModuleDef {
  id: string;
  label: string;
  to: string;
  icon: typeof Film;
  enabled: boolean;
}

const modules: ModuleDef[] = [
  { id: "media", label: "Media", to: "/media", icon: Film, enabled: false },
  { id: "cut", label: "Cut", to: "/cut", icon: Scissors, enabled: false },
  { id: "edit", label: "Edit", to: "/edit", icon: Edit3, enabled: true },
  {
    id: "fusion",
    label: "Fusion",
    to: "/fusion",
    icon: Sparkles,
    enabled: false,
  },
  { id: "color", label: "Color", to: "/color", icon: Palette, enabled: false },
  {
    id: "fairlight",
    label: "Fairlight",
    to: "/fairlight",
    icon: Sliders,
    enabled: true,
  },
  {
    id: "deliver",
    label: "Deliver",
    to: "/deliver",
    icon: Send,
    enabled: false,
  },
];

const route = useRoute();

function isActive(to: string): boolean {
  return (
    route.path === to ||
    (to === "/edit" && route.path === "/composer") ||
    (to === "/fairlight" && route.path === "/controller")
  );
}
</script>

<template>
  <nav
    class="flex h-[52px] shrink-0 items-stretch justify-center border-t border-[var(--border-panel)] bg-[var(--bg-header)]"
  >
    <div class="flex items-stretch gap-1 px-4">
      <NuxtLink
        v-for="mod in modules"
        :key="mod.id"
        :to="mod.enabled ? mod.to : ''"
        :class="[
          'group relative flex w-[88px] flex-col items-center justify-center gap-0.5',
          'text-[10px] font-medium uppercase tracking-wider',
          'transition-colors select-none',
          mod.enabled
            ? isActive(mod.to)
              ? 'text-[var(--accent-orange)]'
              : 'text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]'
            : 'text-[var(--text-muted)] opacity-60 cursor-not-allowed pointer-events-none',
        ]"
        :tabindex="mod.enabled ? 0 : -1"
        :aria-disabled="!mod.enabled"
      >
        <component
          :is="mod.icon"
          class="size-5"
          :stroke-width="isActive(mod.to) ? 2.25 : 1.75"
        />
        <span class="leading-none">{{ mod.label }}</span>
        <span
          v-if="isActive(mod.to)"
          class="absolute left-0 right-0 top-0 h-0.5 bg-[var(--accent-orange)]"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>
  </nav>
</template>
