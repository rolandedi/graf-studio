<script lang="ts" setup>
import { RESOLUTIONS } from "~/lib/ograf/types";
import type { Resolution } from "~/lib/ograf/types";

const props = defineProps<{
  modelValue: Resolution;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Resolution];
}>();

function select(res: Resolution) {
  emit("update:modelValue", { ...res });
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs text-muted-foreground">Résolution:</span>
    <div class="flex gap-1">
      <Button
        v-for="res in RESOLUTIONS"
        :key="res.label"
        variant="ghost"
        size="sm"
        :class="
          modelValue.label === res.label
            ? 'bg-primary text-primary-foreground'
            : ''
        "
        @click="select(res)"
      >
        {{ res.label }}
      </Button>
    </div>
    <span class="text-xs text-muted-foreground">
      {{ modelValue.width }}×{{ modelValue.height }}
    </span>
  </div>
</template>
