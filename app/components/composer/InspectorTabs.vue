<script setup lang="ts">
import {
  Video,
  Music,
  Sparkles,
  ArrowRightLeft,
  Image,
  FileText,
} from "@lucide/vue";
import { useUiStore, type InspectorTab } from "~/composables/useUiStore";
import { cn } from "@/lib/utils";

const { activeInspectorTab, setInspectorTab } = useUiStore();

const tabs: {
  id: InspectorTab;
  label: string;
  icon: typeof Video;
  enabled: boolean;
}[] = [
  { id: "video", label: "Video", icon: Video, enabled: true },
  { id: "audio", label: "Audio", icon: Music, enabled: false },
  { id: "effects", label: "Effects", icon: Sparkles, enabled: false },
  {
    id: "transition",
    label: "Transition",
    icon: ArrowRightLeft,
    enabled: false,
  },
  { id: "image", label: "Image", icon: Image, enabled: false },
  { id: "file", label: "File", icon: FileText, enabled: false },
];
</script>

<template>
  <div
    class="flex h-7 shrink-0 items-stretch border-b border-[var(--border-panel)] bg-[var(--bg-header)]"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :disabled="!tab.enabled"
      :title="tab.label"
      :class="
        cn(
          'flex h-full flex-1 items-center justify-center gap-1.5 px-2 text-[10px] font-medium uppercase tracking-wider',
          'transition-colors border-b-2 border-transparent',
          activeInspectorTab === tab.id &&
            tab.enabled &&
            'text-[var(--accent-orange)] border-b-[var(--accent-orange)] bg-[var(--bg-panel)]',
          activeInspectorTab !== tab.id &&
            tab.enabled &&
            'text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]',
          !tab.enabled &&
            'text-[var(--text-muted)] opacity-50 cursor-not-allowed',
        )
      "
      @click="tab.enabled && setInspectorTab(tab.id)"
    >
      <component :is="tab.icon" class="size-3.5" />
      <span class="leading-none">{{ tab.label }}</span>
    </button>
  </div>
</template>
