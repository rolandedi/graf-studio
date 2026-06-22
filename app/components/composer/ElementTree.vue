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
    <div
      class="flex items-center justify-between border-b border-border px-3 py-2"
    >
      <span class="text-xs font-semibold text-foreground">Éléments</span>
      <div class="flex gap-1">
        <Button variant="ghost" size="sm" @click="emit('add', 'text')">
          <Type class="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm" @click="emit('add', 'shape')">
          <Square class="size-3.5" />
        </Button>
      </div>
    </div>

    <ScrollArea class="flex-1">
      <div class="p-2">
        <div
          v-if="sortedElements.length === 0"
          class="py-8 text-center text-xs text-muted-foreground"
        >
          Aucun élément.
          <br />
          Cliquez sur + pour ajouter.
        </div>

        <div
          v-for="el in sortedElements"
          :key="el.id"
          draggable="true"
          class="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          :class="
            selectedId === el.id
              ? 'bg-primary/20 text-foreground'
              : 'text-muted-foreground hover:bg-secondary'
          "
          @click="emit('select', el.id)"
          @dragstart="onDragStart($event, el.id)"
          @dragover="onDragOver"
          @drop="onDrop($event, el.id)"
        >
          <GripVertical class="size-3 shrink-0 opacity-40" />
          <component :is="iconFor(el.type)" class="size-3.5 shrink-0" />
          <span class="flex-1 truncate">{{ el.name }}</span>
          <Button
            variant="ghost"
            size="sm"
            class="opacity-0 group-hover:opacity-100"
            @click.stop="emit('remove', el.id)"
          >
            <Trash2 class="size-3" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
