import { reactive, computed, watch } from "vue";
import type { OgrafProject, GraphicElement } from "../lib/ograf/types";
import {
  createEmptyProject,
  createTextElement,
  createShapeElement,
} from "../lib/ograf/types";
import {
  getAllProjects,
  getProject,
  saveProject,
  deleteProject as dbDeleteProject,
} from "../lib/storage/indexeddb";

// Singleton state
const state = reactive<{
  current: OgrafProject | null;
  projects: OgrafProject[];
  selectedElementId: string | null;
  loading: boolean;
}>({
  current: null,
  projects: [],
  selectedElementId: null,
  loading: false,
});

// Debounced auto-save
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSave() {
  if (!state.current) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (state.current) {
      state.current.updatedAt = Date.now();
      await saveProject(state.current);
    }
  }, 800);
}

export function useProjectStore() {
  const currentProject = computed(() => state.current);
  const projects = computed(() => state.projects);
  const selectedElement = computed(() => {
    if (!state.current || !state.selectedElementId) return null;
    return (
      state.current.elements.find((e) => e.id === state.selectedElementId) ??
      null
    );
  });
  const loading = computed(() => state.loading);

  async function loadProjects() {
    state.loading = true;
    try {
      state.projects = await getAllProjects();
    } finally {
      state.loading = false;
    }
  }

  async function loadProject(id: string) {
    state.loading = true;
    try {
      const project = await getProject(id);
      if (project) {
        state.current = project;
        state.selectedElementId = null;
      }
    } finally {
      state.loading = false;
    }
  }

  function newProject(name?: string) {
    state.current = createEmptyProject(name);
    state.selectedElementId = null;
    scheduleAutoSave();
  }

  async function saveCurrent() {
    if (!state.current) return;
    state.current.updatedAt = Date.now();
    await saveProject(state.current);
    await loadProjects();
  }

  async function deleteProject(id: string) {
    await dbDeleteProject(id);
    if (state.current?.id === id) {
      state.current = null;
      state.selectedElementId = null;
    }
    await loadProjects();
  }

  function selectElement(id: string | null) {
    state.selectedElementId = id;
  }

  function addElement(type: "text" | "shape") {
    if (!state.current) return;
    const el: GraphicElement =
      type === "text" ? createTextElement() : createShapeElement();
    state.current.elements.push(el);
    state.selectedElementId = el.id;
    scheduleAutoSave();
  }

  function removeElement(id: string) {
    if (!state.current) return;
    state.current.elements = state.current.elements.filter((e) => e.id !== id);
    // Remove associated keyframe tracks
    state.current.keyframes = state.current.keyframes.filter(
      (k) => k.elementId !== id,
    );
    if (state.selectedElementId === id) {
      state.selectedElementId = null;
    }
    scheduleAutoSave();
  }

  function updateElement(id: string, patch: Partial<GraphicElement>) {
    if (!state.current) return;
    const el = state.current.elements.find((e) => e.id === id);
    if (el) {
      Object.assign(el, patch);
      scheduleAutoSave();
    }
  }

  function reorderElements(ids: string[]) {
    if (!state.current) return;
    const map = new Map(state.current.elements.map((e) => [e.id, e]));
    state.current.elements = ids
      .map((id, index) => {
        const el = map.get(id);
        if (el) el.zIndex = index;
        return el;
      })
      .filter(Boolean) as GraphicElement[];
    scheduleAutoSave();
  }

  // Watch for changes to auto-save
  if (import.meta.client) {
    watch(
      () => state.current,
      () => scheduleAutoSave(),
      { deep: true },
    );
  }

  return {
    state,
    currentProject,
    projects,
    selectedElement,
    loading,
    loadProjects,
    loadProject,
    newProject,
    saveCurrent,
    deleteProject,
    selectElement,
    addElement,
    removeElement,
    updateElement,
    reorderElements,
  };
}
