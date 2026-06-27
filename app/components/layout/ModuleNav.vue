<script setup lang="ts">
import type { LucideIcon } from "@lucide/vue";
import { LibraryBig, TvMinimalPlay, Package, FormIcon } from "@lucide/vue";

interface ModuleDef {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
}

const modules: ModuleDef[] = [
  {
    id: "media",
    label: "Library",
    to: "/library",
    icon: LibraryBig,
    enabled: false,
  },
  {
    id: "composer",
    label: "Composer",
    to: "/composer",
    icon: FormIcon,
    enabled: true,
  },
  {
    id: "controller",
    label: "Controller",
    to: "/controller",
    icon: TvMinimalPlay,
    enabled: true,
  },
  {
    id: "exporter",
    label: "Exporter",
    to: "/exporter",
    icon: Package,
    enabled: false,
  },
];

const route = useRoute();

function isActive(to: string): boolean {
  return (
    route.path === to ||
    (to === "/composer" && route.path === "/composer") ||
    (to === "/controller" && route.path === "/controller")
  );
}
</script>

<template>
  <nav
    class="flex h-13 shrink-0 items-stretch justify-center border-t border-(--border-panel) bg-(--bg-header)"
  >
    <div class="flex items-stretch gap-1 px-4">
      <NuxtLink
        v-for="mod in modules"
        :key="mod.id"
        :to="mod.enabled ? mod.to : ''"
        :class="[
          'group relative flex w-22 flex-col items-center justify-center gap-0.5',
          'text-[10px] font-medium uppercase tracking-wider',
          'transition-colors select-none',
          mod.enabled
            ? isActive(mod.to)
              ? 'text-(--accent-orange)'
              : 'text-(--text-primary) hover:bg-(--bg-panel-2)'
            : 'text-(--text-muted) opacity-60 cursor-not-allowed pointer-events-none',
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
          class="absolute left-0 right-0 top-0 h-0.5 bg-(--accent-orange)"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>
  </nav>
</template>
