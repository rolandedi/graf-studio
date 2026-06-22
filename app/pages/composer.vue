<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { FilePlus, Save, Download } from "@lucide/vue";
import { useProjectStore } from "~/composables/useProjectStore";
import { toast } from "vue-sonner";
import type { KeyframeTrack, Keyframe } from "~/lib/ograf/types";
import { addKeyframe, removeKeyframe } from "~/composables/useKeyframeEngine";

useHead({ title: "Composer" });

const store = useProjectStore();

const project = computed(() => store.currentProject.value);
const selectedElement = computed(() => store.selectedElement.value);

onMounted(() => {
  if (!project.value) {
    store.newProject("Mon Lower Third");
    // Add a default shape + text for a quick start
    store.addElement("shape");
    store.addElement("text");
  }
});

function handleSave() {
  store.saveCurrent();
  toast({ title: "Projet sauvegardé", description: project.value?.name });
}

function handleNew() {
  store.newProject("Nouveau Lower Third");
  toast({ title: "Nouveau projet créé" });
}

function handleExport() {
  toast({
    title: "Export",
    description: "L'export ZIP sera disponible en Phase 6",
  });
}

function handleAddKeyframe(track: KeyframeTrack, keyframe: Keyframe) {
  if (!project.value) return;
  const existingTrack = project.value.keyframes.find(
    (t) => t.elementId === track.elementId && t.property === track.property,
  );
  if (existingTrack) {
    const updated = addKeyframe(existingTrack, keyframe);
    Object.assign(existingTrack, updated);
  } else {
    project.value.keyframes.push({
      elementId: track.elementId,
      property: track.property,
      keyframes: [keyframe],
    });
  }
}

function handleRemoveKeyframe(track: KeyframeTrack, time: number) {
  if (!project.value) return;
  const existingTrack = project.value.keyframes.find(
    (t) => t.elementId === track.elementId && t.property === track.property,
  );
  if (existingTrack) {
    const updated = removeKeyframe(existingTrack, time);
    Object.assign(existingTrack, updated);
  }
}

function handleAddTrack(elementId: string, property: string) {
  if (!project.value) return;
  const exists = project.value.keyframes.find(
    (t) => t.elementId === elementId && t.property === property,
  );
  if (!exists) {
    project.value.keyframes.push({
      elementId,
      property,
      keyframes: [],
    });
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <header
      class="flex items-center justify-between border-b border-border px-4 py-2"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-foreground">Composer</h1>
        <Badge variant="secondary" class="text-xs">Lower Third</Badge>
        <span v-if="project" class="text-xs text-muted-foreground">
          {{ project.name }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="handleNew">
          <FilePlus class="size-3.5" />
          Nouveau
        </Button>
        <Button variant="ghost" size="sm" @click="handleSave">
          <Save class="size-3.5" />
          Sauvegarder
        </Button>
        <Button variant="default" size="sm" @click="handleExport">
          <Download class="size-3.5" />
          Exporter
        </Button>
      </div>
    </header>

    <!-- Main 3-zone layout -->
    <div v-if="project" class="flex flex-1 overflow-hidden">
      <!-- Left: Element Tree -->
      <div class="w-56 shrink-0 border-r border-border bg-card/30">
        <ComposerElementTree
          :elements="project.elements"
          :selected-id="store.state.selectedElementId"
          @select="store.selectElement"
          @add="store.addElement"
          @remove="store.removeElement"
          @reorder="store.reorderElements"
        />
      </div>

      <!-- Center: Canvas Preview -->
      <div class="flex-1 overflow-hidden">
        <ComposerCanvasPreview :project="project" />
      </div>

      <!-- Right: Properties Panel -->
      <div class="w-64 shrink-0 border-l border-border bg-card/30">
        <ComposerPropertiesPanel
          :element="selectedElement"
          @update="store.updateElement"
        />
      </div>
    </div>

    <!-- Bottom: Timeline -->
    <div class="h-48 shrink-0">
      <ComposerTimelineEditor
        :tracks="project?.keyframes ?? []"
        :selected-element-id="store.state.selectedElementId"
        :element-name="selectedElement?.name ?? null"
        @add-keyframe="handleAddKeyframe"
        @remove-keyframe="handleRemoveKeyframe"
        @add-track="handleAddTrack"
      />
    </div>
  </div>
</template>
