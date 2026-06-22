<script lang="ts" setup>
import { ref, watch, computed } from "vue";
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
  <div class="space-y-3 p-3">
    <div v-if="properties.length === 0" class="py-2 text-center text-xs text-muted-foreground">
      Aucune donnée dynamique
    </div>

    <div v-for="prop in properties" :key="prop.key" class="space-y-1">
      <span class="text-xs font-medium text-muted-foreground">
        {{ prop.title ?? prop.key }}
      </span>

      <!-- String -->
      <Input
        v-if="prop.type === 'string' && !prop.enum"
        :model-value="String(localData[prop.key] ?? '')"
        size="sm"
        @update:model-value="updateField(prop.key, $event)"
      />

      <!-- Number -->
      <Input
        v-else-if="prop.type === 'number' || prop.type === 'integer'"
        type="number"
        :model-value="Number(localData[prop.key] ?? 0)"
        size="sm"
        @update:model-value="updateField(prop.key, Number($event))"
      />

      <!-- Boolean -->
      <Checkbox
        v-else-if="prop.type === 'boolean'"
        :model-value="Boolean(localData[prop.key] ?? false)"
        @update:model-value="updateField(prop.key, $event)"
      />

      <!-- Enum -->
      <Select
        v-else-if="prop.enum"
        :model-value="String(localData[prop.key] ?? '')"
        @update:model-value="updateField(prop.key, $event)"
      >
        <SelectTrigger class="h-8 text-xs">
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

    <Button v-if="properties.length > 0" size="sm" class="w-full" @click="submit">
      Mettre à jour
    </Button>
  </div>
</template>
