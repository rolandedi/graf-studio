<script setup lang="ts">
import { computed } from "vue";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type {
  GraphicElement,
  TextProperties,
  ShapeProperties,
} from "~/lib/ograf/types";
import InspectorTabs from "./InspectorTabs.vue";
import InspectorSection from "./InspectorSection.vue";
import InspectorField from "./InspectorField.vue";

const props = defineProps<{
  element: GraphicElement | null;
}>();

const emit = defineEmits<{
  update: [id: string, patch: Partial<GraphicElement>];
}>();

const el = computed(() => props.element);

function updateProp(key: keyof GraphicElement, value: unknown) {
  if (!el.value) return;
  emit("update", el.value.id, { [key]: value } as Partial<GraphicElement>);
}

function updateTextProp(key: keyof TextProperties, value: unknown) {
  if (!el.value || el.value.type !== "text") return;
  const next = { ...el.value.properties, [key]: value };
  emit("update", el.value.id, { properties: next });
}

function updateShapeProp(key: keyof ShapeProperties, value: unknown) {
  if (!el.value || el.value.type !== "shape") return;
  const next = { ...el.value.properties, [key]: value };
  emit("update", el.value.id, { properties: next });
}

const textProps = computed(() => {
  if (!el.value || el.value.type !== "text") return null;
  return el.value.properties;
});

const shapeProps = computed(() => {
  if (!el.value || el.value.type !== "shape") return null;
  return el.value.properties;
});
</script>

<template>
  <div class="flex h-full flex-col">
    <InspectorTabs />

    <div v-if="!el" class="flex flex-1 items-center justify-center p-4">
      <span class="text-[11px] text-[var(--text-muted)]">
        Aucun élément sélectionné
      </span>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <!-- Inspector header: element name + type badge -->
      <div
        class="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-2 py-1.5"
      >
        <Input
          :model-value="el.name"
          class="h-6 w-full bg-transparent border-transparent text-[12px] font-medium text-[var(--text-primary)] focus-visible:bg-[var(--bg-input)] focus-visible:border-[var(--border-panel)] rounded-[2px]"
          @update:model-value="(v) => updateProp('name', v)"
        />
        <span
          class="ml-2 shrink-0 rounded-[2px] bg-[var(--bg-panel-2)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          {{ el.type }}
        </span>
      </div>

      <!-- TRANSFORM -->
      <InspectorSection id="transform" title="Transform" default-open>
        <div class="grid grid-cols-2 gap-1.5">
          <InspectorField
            label="Position X"
            type="number"
            :model-value="el.x"
            width="half"
            @update:model-value="(v) => updateProp('x', v)"
          />
          <InspectorField
            label="Position Y"
            type="number"
            :model-value="el.y"
            width="half"
            @update:model-value="(v) => updateProp('y', v)"
          />
          <InspectorField
            label="Rotation"
            type="number"
            :model-value="el.rotation"
            width="half"
            @update:model-value="(v) => updateProp('rotation', v)"
          />
        </div>
      </InspectorSection>

      <!-- COMPOSITE -->
      <InspectorSection id="composite" title="Composite" default-open>
        <div class="grid grid-cols-2 gap-1.5">
          <InspectorField
            label="Opacity"
            type="number"
            :min="0"
            :max="1"
            :step="0.1"
            :model-value="el.opacity"
            width="half"
            @update:model-value="(v) => updateProp('opacity', v)"
          />
        </div>
      </InspectorSection>

      <!-- TYPE-SPECIFIC SECTIONS -->
      <template v-if="textProps">
        <InspectorSection id="text" title="Text" default-open>
          <div class="space-y-1.5">
            <div class="space-y-0.5">
              <label
                class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Contenu
              </label>
              <Textarea
                :model-value="textProps.content"
                :rows="3"
                class="w-full bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] rounded-[2px]"
                @update:model-value="(v) => updateTextProp('content', v)"
              />
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <InspectorField
                label="Taille"
                type="number"
                :model-value="textProps.fontSize"
                width="half"
                @update:model-value="(v) => updateTextProp('fontSize', v)"
              />
              <div class="space-y-0.5">
                <label
                  class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Graisse
                </label>
                <Select
                  :model-value="textProps.fontWeight"
                  @update:model-value="(v) => updateTextProp('fontWeight', v)"
                >
                  <SelectTrigger
                    class="h-6 w-full px-1.5 text-[11px] bg-[var(--bg-input)] border-[var(--border-panel)] rounded-[2px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Normal</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semibold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="space-y-0.5">
              <label
                class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Couleur
              </label>
              <div class="flex gap-1">
                <input
                  type="color"
                  :value="textProps.color"
                  class="h-6 w-8 cursor-pointer rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] p-0"
                  @input="
                    (e) =>
                      updateTextProp(
                        'color',
                        (e.target as HTMLInputElement).value,
                      )
                  "
                />
                <Input
                  :model-value="textProps.color"
                  class="h-6 flex-1 bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] rounded-[2px] px-1.5"
                  @update:model-value="(v) => updateTextProp('color', v)"
                />
              </div>
            </div>
            <div class="space-y-0.5">
              <label
                class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Alignement
              </label>
              <Select
                :model-value="textProps.textAlign"
                @update:model-value="(v) => updateTextProp('textAlign', v)"
              >
                <SelectTrigger
                  class="h-6 w-full px-1.5 text-[11px] bg-[var(--bg-input)] border-[var(--border-panel)] rounded-[2px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </InspectorSection>
      </template>

      <template v-if="shapeProps">
        <InspectorSection id="shape" title="Shape" default-open>
          <div class="space-y-1.5">
            <div class="space-y-0.5">
              <label
                class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Type
              </label>
              <Select
                :model-value="shapeProps.shapeType"
                @update:model-value="(v) => updateShapeProp('shapeType', v)"
              >
                <SelectTrigger
                  class="h-6 w-full px-1.5 text-[11px] bg-[var(--bg-input)] border-[var(--border-panel)] rounded-[2px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="rounded-rect">Coins arrondis</SelectItem>
                  <SelectItem value="circle">Cercle</SelectItem>
                  <SelectItem value="line">Ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-0.5">
              <label
                class="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Remplissage
              </label>
              <div class="flex gap-1">
                <input
                  type="color"
                  :value="shapeProps.fillColor"
                  class="h-6 w-8 cursor-pointer rounded-[2px] border border-[var(--border-panel)] bg-[var(--bg-input)] p-0"
                  @input="
                    (e) =>
                      updateShapeProp(
                        'fillColor',
                        (e.target as HTMLInputElement).value,
                      )
                  "
                />
                <Input
                  :model-value="shapeProps.fillColor"
                  class="h-6 flex-1 bg-[var(--bg-input)] border-[var(--border-panel)] text-[11px] rounded-[2px] px-1.5"
                  @update:model-value="(v) => updateShapeProp('fillColor', v)"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <InspectorField
                label="Largeur"
                type="number"
                :model-value="el.width"
                width="half"
                @update:model-value="(v) => updateProp('width', v)"
              />
              <InspectorField
                label="Hauteur"
                type="number"
                :model-value="el.height"
                width="half"
                @update:model-value="(v) => updateProp('height', v)"
              />
              <InspectorField
                label="Bordure"
                type="number"
                :model-value="shapeProps.strokeWidth"
                width="half"
                @update:model-value="(v) => updateShapeProp('strokeWidth', v)"
              />
              <InspectorField
                label="Radius"
                type="number"
                :model-value="shapeProps.borderRadius"
                width="half"
                @update:model-value="(v) => updateShapeProp('borderRadius', v)"
              />
            </div>
          </div>
        </InspectorSection>
      </template>
    </div>
  </div>
</template>
