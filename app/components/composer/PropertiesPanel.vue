<script lang="ts" setup>
import { computed } from "vue";
import type {
  GraphicElement,
  TextProperties,
  ShapeProperties,
} from "~/lib/ograf/types";

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
  const props = { ...(el.value.properties as TextProperties), [key]: value };
  emit("update", el.value.id, { properties: props });
}

function updateShapeProp(key: keyof ShapeProperties, value: unknown) {
  if (!el.value || el.value.type !== "shape") return;
  const props = { ...(el.value.properties as ShapeProperties), [key]: value };
  emit("update", el.value.id, { properties: props });
}

const textProps = computed(() => {
  if (!el.value || el.value.type !== "text") return null;
  return el.value.properties as TextProperties;
});

const shapeProps = computed(() => {
  if (!el.value || el.value.type !== "shape") return null;
  return el.value.properties as ShapeProperties;
});
</script>

<template>
  <div class="flex h-full flex-col">
    <div
      class="border-b border-border px-3 py-2 text-xs font-semibold text-foreground"
    >
      Propriétés
    </div>

    <ScrollArea class="flex-1">
      <div v-if="!el" class="py-8 text-center text-xs text-muted-foreground">
        Sélectionnez un élément
      </div>

      <div v-else class="space-y-4 p-3">
        <!-- Common properties -->
        <div class="space-y-2">
          <span class="text-xs font-medium text-muted-foreground">Nom</span>
          <Input
            :model-value="el.name"
            size="sm"
            @update:model-value="updateProp('name', $event)"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground">X</span>
            <Input
              type="number"
              :model-value="el.x"
              size="sm"
              @update:model-value="updateProp('x', Number($event))"
            />
          </div>
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground">Y</span>
            <Input
              type="number"
              :model-value="el.y"
              size="sm"
              @update:model-value="updateProp('y', Number($event))"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Largeur</span
            >
            <Input
              type="number"
              :model-value="el.width"
              size="sm"
              @update:model-value="updateProp('width', Number($event))"
            />
          </div>
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Hauteur</span
            >
            <Input
              type="number"
              :model-value="el.height"
              size="sm"
              @update:model-value="updateProp('height', Number($event))"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Rotation (°)</span
            >
            <Input
              type="number"
              :model-value="el.rotation"
              size="sm"
              @update:model-value="updateProp('rotation', Number($event))"
            />
          </div>
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Opacité</span
            >
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              :model-value="el.opacity"
              size="sm"
              @update:model-value="updateProp('opacity', Number($event))"
            />
          </div>
        </div>

        <!-- Text-specific properties -->
        <template v-if="textProps">
          <Separator />
          <div class="space-y-2">
            <span class="text-xs font-medium text-muted-foreground"
              >Contenu</span
            >
            <Textarea
              :model-value="textProps.content"
              size="sm"
              @update:model-value="updateTextProp('content', $event)"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground"
                >Taille police</span
              >
              <Input
                type="number"
                :model-value="textProps.fontSize"
                size="sm"
                @update:model-value="updateTextProp('fontSize', Number($event))"
              />
            </div>
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground"
                >Graisse</span
              >
              <Select
                :model-value="textProps.fontWeight"
                @update:model-value="updateTextProp('fontWeight', $event)"
              >
                <SelectTrigger class="h-8 text-xs">
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

          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Couleur</span
            >
            <div class="flex gap-2">
              <Input
                type="color"
                :model-value="textProps.color"
                class="h-8 w-12 p-1"
                @update:model-value="updateTextProp('color', $event)"
              />
              <Input
                :model-value="textProps.color"
                size="sm"
                @update:model-value="updateTextProp('color', $event)"
              />
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Alignement</span
            >
            <Select
              :model-value="textProps.textAlign"
              @update:model-value="updateTextProp('textAlign', $event)"
            >
              <SelectTrigger class="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centre</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </template>

        <!-- Shape-specific properties -->
        <template v-if="shapeProps">
          <Separator />
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Type de forme</span
            >
            <Select
              :model-value="shapeProps.shapeType"
              @update:model-value="updateShapeProp('shapeType', $event)"
            >
              <SelectTrigger class="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="rounded-rect">Rectangle arrondi</SelectItem>
                <SelectItem value="circle">Cercle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Couleur de fond</span
            >
            <div class="flex gap-2">
              <Input
                type="color"
                :model-value="shapeProps.fillColor"
                class="h-8 w-12 p-1"
                @update:model-value="updateShapeProp('fillColor', $event)"
              />
              <Input
                :model-value="shapeProps.fillColor"
                size="sm"
                @update:model-value="updateShapeProp('fillColor', $event)"
              />
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground"
              >Couleur de bordure</span
            >
            <div class="flex gap-2">
              <Input
                type="color"
                :model-value="shapeProps.strokeColor"
                class="h-8 w-12 p-1"
                @update:model-value="updateShapeProp('strokeColor', $event)"
              />
              <Input
                :model-value="shapeProps.strokeColor"
                size="sm"
                @update:model-value="updateShapeProp('strokeColor', $event)"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground"
                >Épaisseur bordure</span
              >
              <Input
                type="number"
                :model-value="shapeProps.strokeWidth"
                size="sm"
                @update:model-value="
                  updateShapeProp('strokeWidth', Number($event))
                "
              />
            </div>
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground"
                >Rayon coins</span
              >
              <Input
                type="number"
                :model-value="shapeProps.borderRadius"
                size="sm"
                @update:model-value="
                  updateShapeProp('borderRadius', Number($event))
                "
              />
            </div>
          </div>
        </template>
      </div>
    </ScrollArea>
  </div>
</template>
