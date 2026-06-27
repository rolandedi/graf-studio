<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { JSONSchema, JSONSchemaProperty } from "~/lib/ograf/types";

const props = defineProps<{
  schema: JSONSchema;
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, unknown>];
  submit: [value: Record<string, unknown>];
}>();

const localData = ref<Record<string, unknown>>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val };
  },
  { deep: true },
);

const properties = computed(() => {
  if (!props.schema.properties) return [];
  return Object.entries(props.schema.properties).map(([key, prop]) => ({
    key,
    ...prop,
  }));
});

function updateField(key: string, value: unknown) {
  localData.value[key] = value;
  emit("update:modelValue", { ...localData.value });
}

function submit() {
  emit("submit", { ...localData.value });
}
</script>

<template>
  <div class="space-y-1.5 p-2">
    <div
      v-if="properties.length === 0"
      class="py-2 text-center text-[10px] text-[var(--text-muted)]"
    >
      Aucune donnée dynamique
    </div>

    <div
      v-for="prop in properties"
      :key="prop.key"
      class="flex items-center gap-2"
    >
      <label
        class="w-20 shrink-0 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
      >
        {{ prop.title ?? prop.key }}
      </label>

      <div class="min-w-0 flex-1">
        <!-- String -->
        <Input
          v-if="prop.type === 'string' && !prop.enum"
          :model-value="String(localData[prop.key] ?? '')"
          class="h-6 w-full bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] rounded-[2px] px-1.5"
          @update:model-value="(v) => updateField(prop.key, v)"
        />

        <!-- Number -->
        <Input
          v-else-if="prop.type === 'number' || prop.type === 'integer'"
          type="number"
          :model-value="Number(localData[prop.key] ?? 0)"
          class="h-6 w-full bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] tabular-nums rounded-[2px] px-1.5"
          @update:model-value="(v) => updateField(prop.key, Number(v))"
        />

        <!-- Boolean -->
        <Checkbox
          v-else-if="prop.type === 'boolean'"
          :model-value="Boolean(localData[prop.key] ?? false)"
          @update:model-value="(v) => updateField(prop.key, v)"
        />

        <!-- Enum -->
        <Select
          v-else-if="prop.enum"
          :model-value="String(localData[prop.key] ?? '')"
          @update:model-value="(v) => updateField(prop.key, v)"
        >
          <SelectTrigger
            class="h-6 w-full bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] rounded-[2px] px-1.5"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in prop.enum"
              :key="String(opt)"
              :value="String(opt)"
            >
              {{ opt }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <button
      v-if="properties.length > 0"
      type="button"
      class="mt-1 flex h-6 w-full items-center justify-center rounded-[2px] bg-[var(--accent-blue)] text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-[var(--accent-blue)]/90"
      @click="submit"
    >
      Mettre à jour
    </button>
  </div>
</template>
