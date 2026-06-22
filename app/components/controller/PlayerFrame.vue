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

const displayStyle = computed(() => {
  // Scale to fit a reasonable preview area
  const maxW = 600;
  const maxH = 340;
  const scale = Math.min(
    maxW / props.resolution.width,
    maxH / props.resolution.height,
  );
  return {
    width: `${props.resolution.width}px`,
    height: `${props.resolution.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };
});

const containerStyle = computed(() => {
  const maxW = 600;
  const maxH = 340;
  const scale = Math.min(
    maxW / props.resolution.width,
    maxH / props.resolution.height,
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

// Expose bridge to parent
defineExpose({
  bridge,
  loadGraphic,
  isLoaded,
});

// Regenerate when project changes (debounced)
let regenTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => props.project,
  () => {
    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => regenerate(), 500);
  },
  { deep: true },
);

// Load when ready
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
    <!-- Player label -->
    <div class="flex items-center gap-2 border-b border-border px-3 py-1.5">
      <div
        class="size-2 rounded-full"
        :style="{ background: labelColor ?? 'var(--primary)' }"
      />
      <span class="text-xs font-semibold text-foreground">{{ label }}</span>
      <Badge v-if="isLoaded" variant="secondary" class="ml-auto text-xs">
        Loaded
      </Badge>
    </div>

    <!-- Player iframe -->
    <div
      class="flex flex-1 items-center justify-center overflow-hidden bg-black/40 p-3"
    >
      <div
        class="relative bg-black shadow-xl ring-1 ring-border"
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
