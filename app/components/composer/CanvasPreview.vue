<script lang="ts" setup>
import { ref, watch, onUnmounted, computed } from "vue";
import { Play, Square, ZoomIn, ZoomOut } from "@lucide/vue";
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

// Regenerate when project changes (debounced)
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

// Load graphic when blob URL changes and iframe is ready
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

// Initial generation
onMounted(() => {
  regenerate();
});
</script>

<template>
  <div class="flex h-full flex-col bg-background/50">
    <!-- Canvas toolbar -->
    <div
      class="flex items-center justify-between border-b border-border px-3 py-1.5"
    >
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          :disabled="isPlaying"
          @click="playGraphic"
        >
          <Play class="size-3.5" />
          Play
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :disabled="!isPlaying"
          @click="stopGraphic"
        >
          <Square class="size-3.5" />
          Stop
        </Button>
      </div>
      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <Button variant="ghost" size="sm" @click="zoomOut">
          <ZoomOut class="size-3.5" />
        </Button>
        <span class="w-12 text-center">{{ Math.round(zoom * 100) }}%</span>
        <Button variant="ghost" size="sm" @click="zoomIn">
          <ZoomIn class="size-3.5" />
        </Button>
      </div>
    </div>

    <!-- Canvas area -->
    <div class="flex flex-1 items-center justify-center overflow-auto p-4">
      <div
        class="relative bg-black shadow-2xl ring-1 ring-border"
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
