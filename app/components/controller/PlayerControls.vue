<script lang="ts" setup>
import { Play, Square, SkipForward, RotateCcw } from "@lucide/vue";

const props = defineProps<{
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
  <div class="flex items-center gap-2 border-t border-border px-3 py-2">
    <!-- Play controls -->
    <Button
      variant="default"
      size="sm"
      :disabled="!isLoaded"
      @click="playNext"
    >
      <Play class="size-3.5" />
      Play
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :disabled="!isLoaded"
      @click="playInstant"
    >
      <SkipForward class="size-3.5" />
      Skip
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :disabled="!isLoaded"
      @click="stop"
    >
      <Square class="size-3.5" />
      Stop
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :disabled="!isLoaded"
      @click="stopInstant"
    >
      <RotateCcw class="size-3.5" />
      Cut
    </Button>

    <!-- Step indicator -->
    <div class="ml-auto flex items-center gap-2">
      <span class="text-xs text-muted-foreground">
        Step: {{ currentStep ?? "—" }}
      </span>
      <div v-if="stepCount > 1" class="flex gap-1">
        <Button
          v-for="s in stepCount"
          :key="s"
          variant="ghost"
          size="sm"
          class="h-6 px-2 text-xs"
          :class="currentStep === s - 1 ? 'bg-primary text-primary-foreground' : ''"
          @click="gotoStep(s - 1)"
        >
          {{ s - 1 }}
        </Button>
      </div>
    </div>
  </div>
</template>
