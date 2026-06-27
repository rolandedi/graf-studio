<script lang="ts" setup>
import { ref, watch, onUnmounted, computed } from "vue";
import { useOgrafBridge } from "~/composables/useOgrafBridge";
import { createGraphicBlobURL } from "~/lib/ograf/webcomponent-generator";
import type { OgrafProject, Resolution } from "~/lib/ograf/types";

const props = defineProps<{
  project: OgrafProject;
  resolution: Resolution;
  label: string;
  labelColor?: string;
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const blobUrl = ref<string>("");
const isLoaded = ref(false);

const bridge = useOgrafBridge(iframeRef);

const PREVIEW_MAX_W = 560;
const PREVIEW_MAX_H = 320;

const displayStyle = computed(() => {
  const scale = Math.min(
    PREVIEW_MAX_W / props.resolution.width,
    PREVIEW_MAX_H / props.resolution.height,
  );
  return {
    width: `${props.resolution.width}px`,
    height: `${props.resolution.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };
});

const containerStyle = computed(() => {
  const scale = Math.min(
    PREVIEW_MAX_W / props.resolution.width,
    PREVIEW_MAX_H / props.resolution.height,
  );
  return {
    width: `${props.resolution.width * scale}px`,
    height: `${props.resolution.height * scale}px`,
  };
});

function regenerate() {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
  blobUrl.value = createGraphicBlobURL(props.project);
  bridge.reset();
  isLoaded.value = false;
}

async function loadGraphic() {
  try {
    await bridge.load({
      data: props.project.defaultData,
      renderType: "realtime",
    });
    isLoaded.value = true;
  } catch (e) {
    console.error(`[${props.label}] Failed to load:`, e);
  }
}

defineExpose({ bridge, loadGraphic, isLoaded });

let regenTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => props.project,
  () => {
    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => regenerate(), 500);
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
  <div class="flex h-full flex-col">
    <!-- Player label header (DaVinci style) -->
    <div
      class="flex h-7 shrink-0 items-center gap-2 border-b border-[var(--border-panel)] bg-[var(--bg-header)] px-2"
    >
      <div
        class="size-2 rounded-full ring-1 ring-black/30"
        :style="{ background: labelColor ?? 'var(--accent-blue)' }"
      />
      <span
        class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-primary)]"
      >
        {{ label }}
      </span>
      <span
        v-if="isLoaded"
        class="ml-auto rounded-[2px] bg-[var(--bg-panel-2)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
      >
        Loaded
      </span>
      <span
        v-else
        class="ml-auto rounded-[2px] bg-[var(--bg-panel-2)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
      >
        Loading…
      </span>
    </div>

    <!-- Player iframe -->
    <div
      class="flex flex-1 items-center justify-center overflow-hidden bg-black/50 p-3"
    >
      <div
        class="relative bg-black shadow-xl ring-1 ring-[var(--border-panel)]"
        :style="containerStyle"
      >
        <iframe
          ref="iframeRef"
          :src="blobUrl"
          :title="`${label} Player`"
          class="absolute inset-0 border-0"
          sandbox="allow-scripts allow-same-origin"
          :style="displayStyle"
        />
      </div>
    </div>
  </div>
</template>
