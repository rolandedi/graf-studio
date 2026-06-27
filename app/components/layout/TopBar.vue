<script setup lang="ts">
import {
  Film,
  Sparkles,
  ListTree,
  Music,
  PanelRightOpen,
  PanelRightClose,
  Download,
  Info,
} from "@lucide/vue";
import { useUiStore, type LeftPanel } from "~/composables/useUiStore";
import SidebarTab from "./SidebarTab.vue";

const ui = useUiStore();
const { activeLeftPanel, rightPanelVisible, setLeftPanel, toggleRightPanel } =
  ui;

const leftItems: {
  id: LeftPanel;
  label: string;
  icon: typeof Film;
  title: string;
}[] = [
  { id: "media", label: "Media Pool", icon: Film, title: "Media Pool" },
  { id: "effects", label: "Effects", icon: Sparkles, title: "Effects" },
  { id: "index", label: "Index", icon: ListTree, title: "Index" },
  { id: "sound", label: "Sound Library", icon: Music, title: "Sound Library" },
];
</script>

<template>
  <header
    class="flex h-9 shrink-0 items-center justify-between border-b border-[var(--border-panel)] bg-[var(--bg-header)] px-2"
  >
    <!-- Left side: panel switcher -->
    <div class="flex items-center">
      <SidebarTab
        v-for="item in leftItems"
        :key="item.id"
        :icon="item.icon"
        :label="item.label"
        :title="item.title"
        :active="activeLeftPanel === item.id"
        :disabled="item.id !== 'media'"
        @click="setLeftPanel(item.id)"
      />
    </div>

    <!-- Center/right: actions -->
    <div class="flex items-center">
      <button
        type="button"
        title="Quick Export"
        class="flex h-9 items-center gap-1.5 px-2.5 text-[11px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-2)] border-b-2 border-transparent"
      >
        <Download class="size-4" />
        <span class="leading-none">Quick Export</span>
      </button>
      <button
        type="button"
        title="Metadata"
        class="flex h-9 items-center gap-1.5 px-2.5 text-[11px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-2)] border-b-2 border-transparent"
      >
        <Info class="size-4" />
        <span class="leading-none">Metadata</span>
      </button>

      <div class="mx-2 h-5 w-px bg-[var(--border-panel)]" />

      <button
        type="button"
        :title="rightPanelVisible ? 'Hide Inspector' : 'Show Inspector'"
        class="flex h-9 items-center gap-1.5 px-2.5 text-[11px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-2)] border-b-2 border-transparent"
        @click="toggleRightPanel()"
      >
        <component
          :is="rightPanelVisible ? PanelRightClose : PanelRightOpen"
          class="size-4"
        />
        <span class="leading-none">Inspector</span>
      </button>
    </div>
  </header>
</template>
