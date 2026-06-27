<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted, computed } from "vue";
import {
  Play,
  Square,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Maximize2,
} from "@lucide/vue";
import { useOgrafBridge } from "~/composables/useOgrafBridge";
import { createGraphicBlobURL } from "~/lib/ograf/webcomponent-generator";
import type { OgrafProject } from "~/lib/ograf/types";

const props = defineProps<{
  project: OgrafProject;
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const blobUrl = ref<string>("");
const zoom = ref(1);
const isPlaying = ref(false);

const bridge = useOgrafBridge(iframeRef);

const iframeStyle = computed(() => ({
  width: `${props.project.resolution.width}px`,
  height: `${props.project.resolution.height}px`,
  transform: `scale(${zoom.value})`,
  transformOrigin: "top left",
}));

const containerStyle = computed(() => ({
  width: `${props.project.resolution.width * zoom.value}px`,
  height: `${props.project.resolution.height * zoom.value}px`,
}));

function regenerate() {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
  blobUrl.value = createGraphicBlobURL(props.project);
  bridge.reset();
}

const MAX_RETRIES = 3;
const retryCount = ref(0);

async function loadGraphic() {
  try {
    await bridge.load({
      data: props.project.defaultData,
      renderType: "realtime",
    });
    retryCount.value = 0;
  } catch (e) {
    console.error("Failed to load graphic:", e);
    if (retryCount.value < MAX_RETRIES) {
      retryCount.value++;
      console.log(`Retrying load (${retryCount.value}/${MAX_RETRIES})...`);
      setTimeout(() => loadGraphic(), 500);
    }
  }
}

async function playGraphic() {
  isPlaying.value = true;
  try {
    await bridge.playAction({ delta: 1 });
  } catch (e) {
    console.error("Play failed:", e);
  }
}

async function stopGraphic() {
  isPlaying.value = false;
  try {
    await bridge.stopAction();
  } catch (e) {
    console.error("Stop failed:", e);
  }
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, 2);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, 0.1);
}

function fitToView() {
  zoom.value = 1;
}

let regenTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => props.project,
  () => {
    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => {
      regenerate();
    }, 500);
  },
  { deep: true },
);

watch(
  () => bridge.isReady.value,
  async (ready) => {
    if (ready && blobUrl.value) {
      await loadGraphic();
    }
  },
);

onUnmounted(() => {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
});

onMounted(() => {
  regenerate();
});
</script>

<template>
  <div class="flex h-full flex-col bg-(--bg-canvas)">
    <!-- Transport bar — DaVinci Resolve style -->
    <div
      class="flex h-7 shrink-0 items-center gap-1 border-b border-(--border-subtle) bg-(--bg-header) px-2"
    >
      <!-- Left: transport controls -->
      <div class="flex items-center gap-0.5">
        <button
          type="button"
          title="Skip to start"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
        >
          <SkipBack class="size-3" />
        </button>
        <button
          type="button"
          title="Step back"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
        >
          <StepBack class="size-3" />
        </button>
        <button
          type="button"
          title="Play"
          :disabled="isPlaying"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-primary) hover:bg-(--bg-panel-2) disabled:opacity-40"
          :class="!isPlaying && 'bg-(--bg-panel-2)'"
          @click="playGraphic"
        >
          <Play class="size-3" />
        </button>
        <button
          type="button"
          title="Stop"
          :disabled="!isPlaying"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-primary) hover:bg-(--bg-panel-2) disabled:opacity-40"
          @click="stopGraphic"
        >
          <Square class="size-3" />
        </button>
        <button
          type="button"
          title="Step forward"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
        >
          <StepForward class="size-3" />
        </button>
        <button
          type="button"
          title="Skip to end"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
        >
          <SkipForward class="size-3" />
        </button>
      </div>

      <!-- Center: timecode -->
      <div
        class="ml-3 flex h-5 items-center gap-1 rounded-[2px] border border-(--border-panel) bg-(--bg-input) px-2"
      >
        <span class="text-[10px] tabular-nums text-(--text-primary)">
          00:00:00:00
        </span>
      </div>

      <!-- Right: zoom -->
      <div class="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          title="Fit"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
          @click="fitToView"
        >
          <Maximize2 class="size-3" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
          @click="zoomOut"
        >
          <ZoomOut class="size-3" />
        </button>
        <span
          class="w-10 text-center text-[10px] tabular-nums text-(--text-secondary)"
        >
          {{ Math.round(zoom * 100) }}%
        </span>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-(--text-secondary) hover:bg-(--bg-panel-2) hover:text-(--text-primary)"
          @click="zoomIn"
        >
          <ZoomIn class="size-3" />
        </button>
      </div>
    </div>

    <!-- Canvas area -->
    <div class="flex flex-1 items-center justify-center overflow-auto p-4">
      <div
        class="relative bg-black shadow-2xl ring-1 ring-(--border-panel)"
        :style="containerStyle"
      >
        <iframe
          ref="iframeRef"
          :src="blobUrl"
          title="OGraf Graphic Preview"
          class="absolute inset-0 border-0"
          sandbox="allow-scripts allow-same-origin"
          :style="iframeStyle"
        />
      </div>
    </div>
  </div>
</template>
