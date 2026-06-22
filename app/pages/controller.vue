<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { Copy, FolderOpen } from "@lucide/vue";
import { toast } from "vue-sonner";
import { useProjectStore } from "~/composables/useProjectStore";
import { RESOLUTIONS } from "~/lib/ograf/types";
import type { Resolution } from "~/lib/ograf/types";

useHead({ title: "Controller" });

const store = useProjectStore();
const project = computed(() => store.currentProject.value);

const resolution = ref<Resolution>({ ...RESOLUTIONS[1] });

// Refs to player frame components
const previewFrameRef = ref<InstanceType<
  typeof import("~/components/controller/PlayerFrame.vue").default
> | null>(null);
const programFrameRef = ref<InstanceType<
  typeof import("~/components/controller/PlayerFrame.vue").default
> | null>(null);

// Data for each player
const previewData = ref<Record<string, unknown>>({});
const programData = ref<Record<string, unknown>>({});

onMounted(async () => {
  await store.loadProjects();
  if (!project.value && store.projects.value.length > 0) {
    await store.loadProject(store.projects.value[0].id);
  } else if (!project.value) {
    store.newProject("Mon Lower Third");
    store.addElement("shape");
    store.addElement("text");
  }
  if (project.value) {
    previewData.value = { ...project.value.defaultData };
    programData.value = { ...project.value.defaultData };
  }
});

// Preview controls
async function previewPlay(params: { goto?: number; delta?: number; skipAnimation?: boolean }) {
  try {
    await previewFrameRef.value?.bridge.playAction(params);
  } catch (e) {
    console.error("Preview play failed:", e);
  }
}

async function previewStop(params: { skipAnimation?: boolean }) {
  try {
    await previewFrameRef.value?.bridge.stopAction(params);
  } catch (e) {
    console.error("Preview stop failed:", e);
  }
}

async function previewGoto(step: number) {
  try {
    await previewFrameRef.value?.bridge.playAction({ goto: step });
  } catch (e) {
    console.error("Preview goto failed:", e);
  }
}

async function previewUpdate(data: Record<string, unknown>) {
  try {
    await previewFrameRef.value?.bridge.updateAction({ data });
  } catch (e) {
    console.error("Preview update failed:", e);
  }
}

// Program controls
async function programPlay(params: { goto?: number; delta?: number; skipAnimation?: boolean }) {
  try {
    await programFrameRef.value?.bridge.playAction(params);
  } catch (e) {
    console.error("Program play failed:", e);
  }
}

async function programStop(params: { skipAnimation?: boolean }) {
  try {
    await programFrameRef.value?.bridge.stopAction(params);
  } catch (e) {
    console.error("Program stop failed:", e);
  }
}

async function programGoto(step: number) {
  try {
    await programFrameRef.value?.bridge.playAction({ goto: step });
  } catch (e) {
    console.error("Program goto failed:", e);
  }
}

async function programUpdate(data: Record<string, unknown>) {
  try {
    await programFrameRef.value?.bridge.updateAction({ data });
  } catch (e) {
    console.error("Program update failed:", e);
  }
}

// Copy preview state to program
async function copyToProgram() {
  programData.value = { ...previewData.value };
  await programUpdate(programData.value);
  toast({ title: "Copié vers Program", description: "Les données du Preview ont été transférées" });
}

// Load project from list
async function loadProject(id: string) {
  await store.loadProject(id);
  if (project.value) {
    previewData.value = { ...project.value.defaultData };
    programData.value = { ...project.value.defaultData };
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
        <h1 class="text-sm font-semibold text-foreground">Controller</h1>
        <Badge variant="secondary" class="text-xs">Preview / Program</Badge>
        <span v-if="project" class="text-xs text-muted-foreground">
          {{ project.name }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <SharedResolutionSelector v-model="resolution" />
        <Button variant="ghost" size="sm">
          <FolderOpen class="size-3.5" />
          Charger
        </Button>
        <Button variant="default" size="sm" @click="copyToProgram">
          <Copy class="size-3.5" />
          Copy to Program
        </Button>
      </div>
    </header>

    <!-- Players side by side -->
    <div v-if="project" class="flex flex-1 overflow-hidden">
      <!-- Preview -->
      <div class="flex flex-1 flex-col border-r border-border">
        <ControllerPlayerFrame
          ref="previewFrameRef"
          :project="project"
          :resolution="resolution"
          label="PREVIEW"
          label-color="#4a90d9"
        />
        <ControllerPlayerControls
          :step-count="project.stepCount"
          :current-step="previewFrameRef?.bridge.currentStep.value"
          :is-loaded="previewFrameRef?.isLoaded.value ?? false"
          @play="previewPlay"
          @stop="previewStop"
          @goto="previewGoto"
        />
        <div class="border-t border-border bg-card/30">
          <div class="border-b border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            Données Preview
          </div>
          <ControllerDataForm
            :schema="project.schema"
            v-model="previewData"
            @submit="previewUpdate"
          />
        </div>
      </div>

      <!-- Program -->
      <div class="flex flex-1 flex-col">
        <ControllerPlayerFrame
          ref="programFrameRef"
          :project="project"
          :resolution="resolution"
          label="PROGRAM"
          label-color="#e67e22"
        />
        <ControllerPlayerControls
          :step-count="project.stepCount"
          :current-step="programFrameRef?.bridge.currentStep.value"
          :is-loaded="programFrameRef?.isLoaded.value ?? false"
          @play="programPlay"
          @stop="programStop"
          @goto="programGoto"
        />
        <div class="border-t border-border bg-card/30">
          <div class="border-b border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            Données Program
          </div>
          <ControllerDataForm
            :schema="project.schema"
            v-model="programData"
            @submit="programUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-1 items-center justify-center">
      <p class="text-sm text-muted-foreground">Aucun projet chargé</p>
    </div>
  </div>
</template>
