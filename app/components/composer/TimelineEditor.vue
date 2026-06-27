<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Diamond, Scissors, Magnet, ZoomIn, ZoomOut } from "@lucide/vue";
import type { KeyframeTrack, Keyframe, EasingType } from "~/lib/ograf/types";
import { getTotalDuration } from "~/composables/useKeyframeEngine";

const props = defineProps<{
  tracks: KeyframeTrack[];
  selectedElementId: string | null;
  elementName: string | null;
}>();

const emit = defineEmits<{
  addKeyframe: [track: KeyframeTrack, keyframe: Keyframe];
  removeKeyframe: [track: KeyframeTrack, time: number];
  updateKeyframe: [track: KeyframeTrack, oldTime: number, keyframe: Keyframe];
  addTrack: [elementId: string, property: string];
}>();

const totalDuration = computed(() => getTotalDuration(props.tracks));
const timeScale = computed(() => 100 / Math.max(totalDuration.value, 1)); // % per ms
const viewDuration = computed(() => Math.max(totalDuration.value, 1000)); // min 1s view

// Filter tracks for the selected element
const visibleTracks = computed(() =>
  props.tracks.filter((t) => t.selectedElementId === props.selectedElementId),
);

const animatableProperties = [
  { key: "x", label: "Position X", color: "#3b82f6" },
  { key: "y", label: "Position Y", color: "#22c55e" },
  { key: "opacity", label: "Opacity", color: "#a855f7" },
  { key: "rotation", label: "Rotation", color: "#f97316" },
  { key: "width", label: "Width", color: "#ef4444" },
  { key: "height", label: "Height", color: "#eab308" },
];

const newProperty = ref<string>("x");
const newTime = ref<number>(0);
const newValue = ref<number>(0);
const newEasing = ref<EasingType>("ease-in-out");

function timeToPercent(time: number): number {
  return (time / viewDuration.value) * 100;
}

function percentToTime(percent: number): number {
  return Math.round((percent / 100) * viewDuration.value);
}

function addKeyframeAtTime() {
  if (!props.selectedElementId) return;
  const track = visibleTracks.value.find(
    (t) => t.property === newProperty.value,
  );
  const kf: Keyframe = {
    time: newTime.value,
    value: newValue.value,
    easing: newEasing.value,
  };
  if (track) {
    emit("addKeyframe", track, kf);
  } else {
    emit("addTrack", props.selectedElementId, newProperty.value);
    emit(
      "addKeyframe",
      {
        elementId: props.selectedElementId,
        property: newProperty.value,
        keyframes: [],
      },
      kf,
    );
  }
}

function removeKf(track: KeyframeTrack, time: number) {
  emit("removeKeyframe", track, time);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = Math.floor(((ms % 1000) / 1000) * 30); // assume 30fps
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

function colorFor(prop: string): string {
  return animatableProperties.find((p) => p.key === prop)?.color ?? "#888";
}

// Ruler tick marks
const rulerTicks = computed(() => {
  const ticks: { percent: number; label: string }[] = [];
  const step = viewDuration.value > 5000 ? 1000 : 500;
  for (let t = 0; t <= viewDuration.value; t += step) {
    ticks.push({
      percent: (t / viewDuration.value) * 100,
      label: formatTime(t),
    });
  }
  return ticks;
});
</script>

<template>
  <div
    class="flex h-full flex-col border-t border-[var(--border-panel)] bg-[var(--bg-panel)]"
  >
    <!-- Toolbar: title + add controls + zoom -->
    <div
      class="flex h-7 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] px-2"
    >
      <span
        class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-primary)]"
      >
        Timeline
      </span>
      <span class="text-[10px] text-[var(--text-muted)] tabular-nums">
        {{ formatTime(totalDuration) }}
      </span>

      <div
        v-if="selectedElementId"
        class="ml-2 flex items-center gap-1.5 border-l border-[var(--border-subtle)] pl-2"
      >
        <select
          v-model="newProperty"
          class="h-5 rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] px-1 text-[10px] text-[var(--text-primary)]"
        >
          <option
            v-for="prop in animatableProperties"
            :key="prop.key"
            :value="prop.key"
          >
            {{ prop.label }}
          </option>
        </select>
        <input
          v-model.number="newTime"
          type="number"
          placeholder="ms"
          class="h-5 w-14 rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] px-1 text-[10px] tabular-nums text-[var(--text-primary)]"
        />
        <input
          v-model.number="newValue"
          type="number"
          placeholder="val"
          class="h-5 w-14 rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] px-1 text-[10px] tabular-nums text-[var(--text-primary)]"
        />
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]"
          title="Ajouter le keyframe"
          @click="addKeyframeAtTime"
        >
          <Plus class="size-3" />
        </button>
      </div>

      <div class="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          title="Snapping"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)]"
        >
          <Magnet class="size-3" />
        </button>
        <button
          type="button"
          title="Razor"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)]"
        >
          <Scissors class="size-3" />
        </button>
        <div class="mx-1 h-3 w-px bg-[var(--border-panel)]" />
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)]"
        >
          <ZoomOut class="size-3" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-[2px] text-[var(--text-secondary)] hover:bg-[var(--bg-panel-2)]"
        >
          <ZoomIn class="size-3" />
        </button>
      </div>
    </div>

    <!-- Tracks area -->
    <div class="flex min-h-0 flex-1">
      <!-- Track headers column -->
      <div
        class="flex w-32 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-header)]"
      >
        <div class="h-5 border-b border-[var(--border-subtle)]" />
        <div
          v-if="!selectedElementId"
          class="flex flex-1 items-center justify-center px-2 text-center text-[10px] text-[var(--text-muted)]"
        >
          Sélectionnez un élément
        </div>
        <div
          v-else-if="visibleTracks.length === 0"
          class="flex flex-1 items-center justify-center px-2 text-center text-[10px] text-[var(--text-muted)]"
        >
          Aucune piste
        </div>
        <div
          v-for="track in visibleTracks"
          :key="track.property"
          class="flex h-7 items-center gap-1.5 border-b border-[var(--border-subtle)] px-2"
        >
          <span
            class="size-2 shrink-0 rounded-full"
            :style="{ background: colorFor(track.property) }"
          />
          <span
            class="flex-1 truncate text-[10px] font-medium text-[var(--text-primary)]"
          >
            {{
              animatableProperties.find((p) => p.key === track.property)
                ?.label ?? track.property
            }}
          </span>
          <span class="text-[9px] tabular-nums text-[var(--text-muted)]">
            {{ track.keyframes.length }}
          </span>
        </div>
      </div>

      <!-- Timeline grid -->
      <div class="flex min-w-0 flex-1 flex-col overflow-x-auto">
        <!-- Ruler -->
        <div
          class="relative h-5 border-b border-[var(--border-subtle)] bg-[var(--bg-header)]"
        >
          <div
            v-for="tick in rulerTicks"
            :key="tick.percent"
            class="absolute top-0 flex h-full flex-col items-start"
            :style="{ left: `${tick.percent}%` }"
          >
            <span
              class="mt-0.5 pl-1 text-[8px] tabular-nums text-[var(--text-muted)]"
            >
              {{ tick.label }}
            </span>
            <span class="mt-auto h-1.5 w-px bg-[var(--border-panel)]" />
          </div>
        </div>

        <!-- Track lanes -->
        <div
          v-if="!selectedElementId"
          class="flex flex-1 items-center justify-center text-[10px] text-[var(--text-muted)]"
        >
          Sélectionnez un élément pour animer
        </div>
        <div
          v-else-if="visibleTracks.length === 0"
          class="flex flex-1 items-center justify-center text-[10px] text-[var(--text-muted)]"
        >
          Aucune animation. Ajoutez un keyframe ci-dessus.
        </div>
        <div v-else class="flex flex-1 flex-col">
          <div
            v-for="track in visibleTracks"
            :key="track.property"
            class="relative h-7 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
            @click="
              (e) => {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                newTime = percentToTime(percent);
              }
            "
          >
            <!-- Track block (Resolve style: colored bar across full duration) -->
            <div
              class="absolute inset-y-1 left-0 right-0 rounded-[1px]"
              :style="{ background: `${colorFor(track.property)}40` }"
            />
            <!-- Keyframe diamonds -->
            <button
              v-for="kf in track.keyframes"
              :key="kf.time"
              type="button"
              :title="`${formatTime(kf.time)}: ${kf.value}`"
              class="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-pointer transition-transform hover:scale-150"
              :style="{
                left: `${timeToPercent(kf.time)}%`,
                background: colorFor(track.property),
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
              }"
              @click.stop="removeKf(track, kf.time)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
