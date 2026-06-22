<script lang="ts" setup>
import { ref, computed } from "vue";
import { Plus } from "@lucide/vue";
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
const timeScale = computed(() => 100 / totalDuration.value); // percentage per ms

// Filter tracks for the selected element
const visibleTracks = computed(() =>
  props.tracks.filter((t) => t.selectedElementId === props.selectedElementId),
);

const animatableProperties = [
  { key: "x", label: "Position X" },
  { key: "y", label: "Position Y" },
  { key: "opacity", label: "Opacité" },
  { key: "rotation", label: "Rotation" },
  { key: "width", label: "Largeur" },
  { key: "height", label: "Hauteur" },
];

const newProperty = ref<string>("x");
const newTime = ref<number>(0);
const newValue = ref<number>(0);
const newEasing = ref<EasingType>("ease-in-out");

function timeToPercent(time: number): number {
  return time * timeScale.value;
}

function percentToTime(percent: number): number {
  return Math.round(percent / timeScale.value);
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
    // After track is created, the parent will need to add the keyframe
    // For now we emit addKeyframe with a new track
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
  return `${(ms / 1000).toFixed(2)}s`;
}
</script>

<template>
  <div class="flex h-full flex-col border-t border-border bg-card/30">
    <!-- Timeline header -->
    <div
      class="flex items-center justify-between border-b border-border px-3 py-1.5"
    >
      <span class="text-xs font-semibold text-foreground">Timeline</span>
      <span class="text-xs text-muted-foreground">
        {{ formatTime(totalDuration) }}
      </span>
    </div>

    <!-- Add keyframe controls -->
    <div
      v-if="selectedElementId"
      class="flex items-center gap-2 border-b border-border px-3 py-2"
    >
      <Select v-model="newProperty" class="h-7 text-xs">
        <SelectTrigger class="h-7 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="prop in animatableProperties"
            :key="prop.key"
            :value="prop.key"
          >
            {{ prop.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-model="newTime"
        type="number"
        placeholder="ms"
        class="h-7 w-16 text-xs"
      />
      <Input
        v-model="newValue"
        type="number"
        placeholder="val"
        class="h-7 w-16 text-xs"
      />
      <Select v-model="newEasing" class="h-7 text-xs">
        <SelectTrigger class="h-7 w-28 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="linear">Linear</SelectItem>
          <SelectItem value="ease-in">Ease In</SelectItem>
          <SelectItem value="ease-out">Ease Out</SelectItem>
          <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" variant="ghost" @click="addKeyframeAtTime">
        <Plus class="size-3" />
      </Button>
    </div>

    <!-- Tracks -->
    <ScrollArea class="flex-1">
      <div class="p-2">
        <div
          v-if="!selectedElementId"
          class="py-4 text-center text-xs text-muted-foreground"
        >
          Sélectionnez un élément pour animer
        </div>

        <div
          v-else-if="visibleTracks.length === 0"
          class="py-4 text-center text-xs text-muted-foreground"
        >
          Aucune animation. Ajoutez un keyframe ci-dessus.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="track in visibleTracks"
            :key="track.property"
            class="rounded-md border border-border p-2"
          >
            <div class="mb-1 flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">
                {{
                  animatableProperties.find((p) => p.key === track.property)
                    ?.label ?? track.property
                }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ track.keyframes.length }} kf
              </span>
            </div>

            <!-- Timeline bar -->
            <div
              class="relative h-8 rounded bg-secondary/50"
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
              <div
                v-for="kf in track.keyframes"
                :key="kf.time"
                class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-accent ring-2 ring-accent/30 hover:scale-125 transition-transform"
                :style="{ left: `${timeToPercent(kf.time)}%` }"
                :title="`${formatTime(kf.time)}: ${kf.value}`"
                @click.stop="removeKf(track, kf.time)"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
