<script lang="ts" setup>
import { Type, Square, Trash2, GripVertical } from "@lucide/vue";
import type { GraphicElement } from "~/lib/ograf/types";

const props = defineProps<{
  elements: GraphicElement[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
  add: [type: "text" | "shape"];
  remove: [id: string];
  reorder: [ids: string[]];
}>();

const sortedElements = computed(() =>
  [...props.elements].sort((a, b) => b.zIndex - a.zIndex),
);

function iconFor(type: string) {
  return type === "text" ? Type : Square;
}

function onDragStart(event: DragEvent, id: string) {
  event.dataTransfer?.setData("text/plain", id);
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
}

function onDrop(event: DragEvent, targetId: string) {
  event.preventDefault();
  const sourceId = event.dataTransfer?.getData("text/plain");
  if (!sourceId || sourceId === targetId) return;

  const ids = sortedElements.value.map((e) => e.id);
  const sourceIdx = ids.indexOf(sourceId);
  const targetIdx = ids.indexOf(targetId);
  if (sourceIdx === -1 || targetIdx === -1) return;

  ids.splice(sourceIdx, 1);
  ids.splice(targetIdx, 0, sourceId);
  emit("reorder", ids);
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Master bin header (DaVinci MediaPool style) -->
    <div
      class="flex h-6 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-2"
    >
      <span
        class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
      >
        Master
      </span>
      <div class="flex gap-0.5">
        <button
          type="button"
          title="Ajouter un texte"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)] hover:text-[var(--text-primary)]"
          @click="emit('add', 'text')"
        >
          <Type class="size-3" />
        </button>
        <button
          type="button"
          title="Ajouter une forme"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)] hover:text-[var(--text-primary)]"
          @click="emit('add', 'shape')"
        >
          <Square class="size-3" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-if="sortedElements.length === 0"
        class="py-8 px-3 text-center text-[10px] text-[var(--text-muted)]"
      >
        Aucun élément.
        <br />
        Cliquez sur + pour ajouter.
      </div>

      <div
        v-for="el in sortedElements"
        :key="el.id"
        draggable="true"
        :class="[
          'group flex h-6 cursor-pointer items-center gap-1.5 pl-2 pr-1 text-[12px] leading-tight',
          'transition-colors border-l-2',
          selectedId === el.id
            ? 'bg-[var(--selection-bg)] border-l-[var(--accent-blue)] text-[var(--text-primary)]'
            : 'border-l-transparent text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]',
        ]"
        @click="emit('select', el.id)"
        @dragstart="onDragStart($event, el.id)"
        @dragover="onDragOver"
        @drop="onDrop($event, el.id)"
      >
        <GripVertical class="size-3 shrink-0 opacity-30" />
        <component :is="iconFor(el.type)" class="size-3 shrink-0 opacity-70" />
        <span class="flex-1 truncate">{{ el.name }}</span>
        <button
          type="button"
          title="Supprimer"
          class="flex h-4 w-4 items-center justify-center rounded-[2px] text-[var(--text-muted)] opacity-0 hover:bg-[var(--accent-red)] hover:text-white group-hover:opacity-100"
          @click.stop="emit('remove', el.id)"
        >
          <Trash2 class="size-2.5" />
        </button>
      </div>
    </div>
  </div>
</template>
