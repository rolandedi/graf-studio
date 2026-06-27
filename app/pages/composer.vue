<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue";
import { FilePlus, Save, Download, FileDown } from "@lucide/vue";
import { useProjectStore } from "~/composables/useProjectStore";
import { toast } from "vue-sonner";
import type { KeyframeTrack, Keyframe } from "~/lib/ograf/types";
import { addKeyframe, removeKeyframe } from "~/composables/useKeyframeEngine";
import { downloadProjectZip, exportProjectJSON } from "~/lib/ograf/export";
import { useUiStore } from "~/composables/useUiStore";

useHead({ title: "Edit" });

const store = useProjectStore();
const { rightPanelVisible } = useUiStore();

const project = computed(() => store.currentProject.value);
const selectedElement = computed(() => store.selectedElement.value);

onMounted(() => {
  if (!project.value) {
    store.newProject("Mon Lower Third");
    // Add a default shape + text for a quick start
    store.addElement("shape");
    store.addElement("text");
  }
  globalThis.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  globalThis.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    handleSave();
  }
}

function handleSave() {
  store.saveCurrent();
  toast({ title: "Projet sauvegardé", description: project.value?.name });
}

function handleNew() {
  store.newProject("Nouveau Lower Third");
  toast({ title: "Nouveau projet créé" });
}

async function handleExport() {
  if (!project.value) return;
  try {
    await downloadProjectZip(project.value);
    toast({
      title: "Export OGraf réussi",
      description: `${project.value.name}.ograf.zip téléchargé`,
    });
  } catch (e) {
    toast({
      title: "Erreur d'export",
      description: e instanceof Error ? e.message : "Erreur inconnue",
      variant: "destructive",
    });
  }
}

function handleExportJSON() {
  if (!project.value) return;
  try {
    exportProjectJSON(project.value);
    toast({ title: "Projet exporté (JSON)" });
  } catch (e) {
    toast({
      title: "Erreur d'export JSON",
      description: e instanceof Error ? e.message : "Erreur inconnue",
      variant: "destructive",
    });
  }
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
      class="flex items-center justify-between border-b border-(--border-panel) bg-(--bg-header) px-3 py-1.5"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-(--text-primary)">Edit</h1>
        <Badge variant="secondary" class="text-[10px]">Lower Third</Badge>
        <span v-if="project" class="text-xs text-(--text-secondary)">
          {{ project.name }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <Button variant="ghost" class="resolve-btn" @click="handleNew">
          <FilePlus class="size-3.5" />
          Nouveau
        </Button>
        <Button variant="ghost" class="resolve-btn" @click="handleSave">
          <Save class="size-3.5" />
          Sauvegarder
        </Button>
        <Button variant="ghost" class="resolve-btn" @click="handleExportJSON">
          <FileDown class="size-3.5" />
          JSON
        </Button>
        <Button variant="default" class="resolve-btn" @click="handleExport">
          <Download class="size-3.5" />
          Exporter OGraf
        </Button>
      </div>
    </header>

    <!-- Main 3-zone layout -->
    <div v-if="project" class="flex flex-1 overflow-hidden">
      <!-- Left: Media Pool (or Effects/Index/Sound per TopBar) -->
      <div class="w-60 shrink-0 border-r border-(--border-panel)">
        <ComposerMediaPoolPanel
          :elements="project.elements"
          :selected-element-id="store.selectedElementId.value"
          :project-name="project.name"
          :project-resolution="`${project.resolution.width}×${project.resolution.height} (${project.resolution.label})`"
          :project-step-count="project.stepCount"
          :project-description="project.description"
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

      <!-- Right: Inspector (toggleable via TopBar) -->
      <div
        v-if="rightPanelVisible"
        class="w-72 shrink-0 border-l border-(--border-panel)"
      >
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
        :selected-element-id="store.selectedElementId.value"
        :element-name="selectedElement?.name ?? null"
        @add-keyframe="handleAddKeyframe"
        @remove-keyframe="handleRemoveKeyframe"
        @add-track="handleAddTrack"
      />
    </div>
  </div>
</template>
