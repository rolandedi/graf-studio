import { reactive, computed } from "vue";

/**
 * UI state for the GrafStudio shell — DaVinci Resolve style.
 * Ephemeral: never persisted. Resets on reload, like Resolve.
 */

export type LeftPanel = "media" | "effects" | "index" | "sound";
export type InspectorTab =
  | "video"
  | "audio"
  | "effects"
  | "transition"
  | "image"
  | "file";

const state = reactive<{
  activeLeftPanel: LeftPanel;
  rightPanelVisible: boolean;
  activeInspectorTab: InspectorTab;
  expandedSections: Set<string>;
  timelineZoom: number;
}>({
  activeLeftPanel: "media",
  rightPanelVisible: true,
  activeInspectorTab: "video",
  expandedSections: new Set(["transform", "composite"]),
  timelineZoom: 1,
});

export function useUiStore() {
  const activeLeftPanel = computed(() => state.activeLeftPanel);
  const rightPanelVisible = computed(() => state.rightPanelVisible);
  const activeInspectorTab = computed(() => state.activeInspectorTab);
  const expandedSections = computed(() => state.expandedSections);
  const timelineZoom = computed(() => state.timelineZoom);

  function setLeftPanel(panel: LeftPanel) {
    state.activeLeftPanel = panel;
  }

  function toggleRightPanel() {
    state.rightPanelVisible = !state.rightPanelVisible;
  }

  function setInspectorTab(tab: InspectorTab) {
    state.activeInspectorTab = tab;
  }

  function toggleSection(id: string) {
    if (state.expandedSections.has(id)) {
      state.expandedSections.delete(id);
    } else {
      state.expandedSections.add(id);
    }
  }

  function setTimelineZoom(zoom: number) {
    state.timelineZoom = Math.min(2, Math.max(0.25, zoom));
  }

  return {
    state,
    activeLeftPanel,
    rightPanelVisible,
    activeInspectorTab,
    expandedSections,
    timelineZoom,
    setLeftPanel,
    toggleRightPanel,
    setInspectorTab,
    toggleSection,
    setTimelineZoom,
  };
}
