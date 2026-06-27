<script lang="ts" setup>
import { Play, Square, SkipForward, RotateCcw } from "@lucide/vue";

defineProps<{
  stepCount: number;
  currentStep: number | undefined;
  isLoaded: boolean;
}>();

const emit = defineEmits<{
  play: [params: { goto?: number; delta?: number; skipAnimation?: boolean }];
  stop: [params: { skipAnimation?: boolean }];
  goto: [step: number];
}>();

function playNext() {
  emit("play", { delta: 1 });
}

function playInstant() {
  emit("play", { delta: 1, skipAnimation: true });
}

function stop() {
  emit("stop", {});
}

function stopInstant() {
  emit("stop", { skipAnimation: true });
}

function gotoStep(step: number) {
  emit("goto", step);
}
</script>

<template>
  <div
    class="flex h-7 shrink-0 items-center gap-1 border-y border-[var(--border-panel)] bg-[var(--bg-header)] px-2"
  >
    <button
      type="button"
      class="flex h-5 items-center gap-1 rounded-[2px] bg-[var(--accent-blue)] px-2 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-[var(--accent-blue)]/90 disabled:opacity-40"
      :disabled="!isLoaded"
      @click="playNext"
    >
      <Play class="size-3" />
      Play
    </button>
    <button
      type="button"
      class="flex h-5 items-center gap-1 rounded-[2px] px-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)] disabled:opacity-40"
      :disabled="!isLoaded"
      title="Skip animation"
      @click="playInstant"
    >
      <SkipForward class="size-3" />
    </button>
    <button
      type="button"
      class="flex h-5 items-center gap-1 rounded-[2px] px-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)] disabled:opacity-40"
      :disabled="!isLoaded"
      title="Stop"
      @click="stop"
    >
      <Square class="size-3" />
    </button>
    <button
      type="button"
      class="flex h-5 items-center gap-1 rounded-[2px] px-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)] disabled:opacity-40"
      :disabled="!isLoaded"
      title="Cut (stop instantly)"
      @click="stopInstant"
    >
      <RotateCcw class="size-3" />
    </button>

    <!-- Step indicator (right) -->
    <div class="ml-auto flex items-center gap-2">
      <span class="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        Step
      </span>
      <div
        class="flex h-5 items-center gap-px rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] px-1.5"
      >
        <span class="text-[11px] font-medium tabular-nums text-[var(--text-primary)]">
          {{ currentStep ?? "—" }}
        </span>
      </div>
      <div v-if="stepCount > 1" class="flex gap-0.5">
        <button
          v-for="s in stepCount"
          :key="s"
          type="button"
          :class="[
            'flex h-5 w-6 items-center justify-center rounded-[2px] text-[10px] font-medium tabular-nums',
            currentStep === s - 1
              ? 'bg-[var(--accent-orange)] text-white'
              : 'text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]',
          ]"
          @click="gotoStep(s - 1)"
        >
          {{ s - 1 }}
        </button>
      </div>
    </div>
  </div>
</template>
