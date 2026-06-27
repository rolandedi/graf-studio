<script setup lang="ts">
import { computed } from "vue";
import { Film, Sparkles, ListTree, Music } from "@lucide/vue";
import { useUiStore, type LeftPanel } from "~/composables/useUiStore";
import ElementTree from "./ElementTree.vue";
import type { GraphicElement } from "~/lib/ograf/types";

const props = defineProps<{
  elements: GraphicElement[];
  selectedElementId: string | null;
  projectName?: string;
  projectDescription?: string;
  projectResolution?: string;
  projectStepCount?: number;
}>();

const emit = defineEmits<{
  select: [id: string];
  add: [type: "text" | "shape"];
  remove: [id: string];
  reorder: [ids: string[]];
}>();

const { activeLeftPanel } = useUiStore();

const panelMeta: Record<
  LeftPanel,
  { icon: typeof Film; title: string; subtitle: string }
> = {
  media: { icon: Film, title: "Media Pool", subtitle: "Master" },
  effects: { icon: Sparkles, title: "Effects", subtitle: "Bientôt" },
  index: { icon: ListTree, title: "Index", subtitle: "Métadonnées" },
  sound: { icon: Music, title: "Sound Library", subtitle: "Bientôt" },
};

const currentMeta = computed(() => panelMeta[activeLeftPanel.value]);
</script>

<template>
  <div class="flex h-full flex-col bg-(--bg-panel)">
    <!-- Top header with current panel name + icon -->
    <div
      class="flex h-7 shrink-0 items-center gap-2 border-b border-(--border-panel) px-2"
    >
      <component
        :is="currentMeta.icon"
        class="size-3.5 text-(--text-secondary)"
      />
      <span
        class="text-[11px] font-semibold uppercase tracking-wider text-(--text-primary)"
      >
        {{ currentMeta.title }}
      </span>
      <span
        class="ml-auto text-[10px] uppercase tracking-wider text-(--text-muted)"
      >
        {{ currentMeta.subtitle }}
      </span>
    </div>

    <!-- Body: switches by activeLeftPanel -->
    <div class="min-h-0 flex-1">
      <!-- Media Pool → ElementTree -->
      <ElementTree
        v-if="activeLeftPanel === 'media'"
        :elements="elements"
        :selected-id="selectedElementId"
        @select="(id) => emit('select', id)"
        @add="(t) => emit('add', t)"
        @remove="(id) => emit('remove', id)"
        @reorder="(ids) => emit('reorder', ids)"
      />

      <!-- Effects → placeholder -->
      <div
        v-else-if="activeLeftPanel === 'effects'"
        class="flex h-full flex-col items-center justify-center gap-2 p-4 text-center"
      >
        <Sparkles class="size-6 text-(--text-muted)" />
        <span class="text-[11px] text-(--text-muted)">
          Bibliothèque d'effets
        </span>
        <span class="text-[10px] text-(--text-muted)">
          Bientôt disponible
        </span>
      </div>

      <!-- Index → project metadata -->
      <div
        v-else-if="activeLeftPanel === 'index'"
        class="h-full overflow-y-auto p-2"
      >
        <div class="space-y-2">
          <div class="space-y-0.5">
            <label
              class="block text-[10px] uppercase tracking-wider text-(--text-secondary)"
            >
              Nom
            </label>
            <div
              class="rounded-[2px] border border-(--border-panel) bg-(--bg-input) px-1.5 py-1 text-[11px] text-[var(--text-primary)]"
            >
              {{ projectName ?? "—" }}
            </div>
          </div>
          <div class="space-y-0.5">
            <label
              class="block text-[10px] uppercase tracking-wider text-(--text-secondary)"
            >
              Résolution
            </label>
            <div
              class="rounded-[2px] border border-(--border-panel) bg-(--bg-input) px-1.5 py-1 text-[11px] text-[var(--text-primary)]"
            >
              {{ projectResolution ?? "—" }}
            </div>
          </div>
          <div class="space-y-0.5">
            <label
              class="block text-[10px] uppercase tracking-wider text-(--text-secondary)"
            >
              Steps
            </label>
            <div
              class="rounded-[2px] border border-(--border-panel) bg-(--bg-input) px-1.5 py-1 text-[11px] text-[var(--text-primary)]"
            >
              {{ projectStepCount ?? 1 }}
            </div>
          </div>
          <div class="space-y-0.5">
            <label
              class="block text-[10px] uppercase tracking-wider text-(--text-secondary)"
            >
              Description
            </label>
            <div
              class="rounded-[2px] border border-(--border-panel) bg-(--bg-input) px-1.5 py-1 text-[11px] text-[var(--text-primary)]"
            >
              {{ projectDescription ?? "—" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sound Library → placeholder -->
      <div
        v-else-if="activeLeftPanel === 'sound'"
        class="flex h-full flex-col items-center justify-center gap-2 p-4 text-center"
      >
        <Music class="size-6 text-(--text-muted)" />
        <span class="text-[11px] text-(--text-muted)"> Sound Library </span>
        <span class="text-[10px] text-(--text-muted)">
          Bientôt disponible
        </span>
      </div>
    </div>
  </div>
</template>
