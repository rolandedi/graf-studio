// GrafStudio — Types TypeScript alignés sur la spec OGraf v1

export interface OgrafProject {
  id: string;
  name: string;
  description?: string;
  author?: Author;
  version: string;
  resolution: Resolution;
  supportsRealTime: boolean;
  supportsNonRealTime: boolean;
  stepCount: number;
  elements: GraphicElement[];
  keyframes: KeyframeTrack[];
  schema: JSONSchema;
  defaultData: Record<string, unknown>;
  updatedAt: number;
}

export interface Author {
  name: string;
  email?: string;
  url?: string;
}

export interface Resolution {
  width: number;
  height: number;
  label: string;
}

export type ElementType = "text" | "shape" | "image";

export interface BaseGraphicElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface TextGraphicElement extends BaseGraphicElement {
  type: "text";
  properties: TextProperties;
}

export interface ShapeGraphicElement extends BaseGraphicElement {
  type: "shape";
  properties: ShapeProperties;
}

export interface ImageGraphicElement extends BaseGraphicElement {
  type: "image";
  properties: ImageProperties;
}

export type GraphicElement =
  | TextGraphicElement
  | ShapeGraphicElement
  | ImageGraphicElement;

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface ShapeProperties {
  shapeType: "rectangle" | "rounded-rect" | "circle" | "line";
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface ImageProperties {
  src: string;
  objectFit: "cover" | "contain" | "fill" | "none";
}

export type EasingType =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier";

export interface KeyframeTrack {
  elementId: string;
  property: string;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number;
  value: number | string;
  easing: EasingType;
  cubicBezier?: [number, number, number, number];
}

// JSON Schema (simplified subset for OGraf manifest schema field)
export interface JSONSchema {
  type: "object" | "string" | "number" | "boolean" | "array" | "integer";
  properties?: Record<string, JSONSchemaProperty>;
  title?: string;
  description?: string;
  required?: string[];
}

export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "integer" | "object" | "array";
  title?: string;
  description?: string;
  default?: unknown;
  hidden?: boolean;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
}

// OGraf Manifest (v1) — generated output
export interface OgrafManifest {
  $schema: string;
  id: string;
  version?: string;
  name: string;
  description?: string;
  author?: Author;
  main: string;
  customActions?: OgrafAction[];
  actionDurations?: OgrafActionDuration[];
  supportsRealTime: boolean;
  supportsNonRealTime: boolean;
  schema?: JSONSchema;
  stepCount?: number;
  renderRequirements?: OgrafRenderRequirement[];
  thumbnails?: OgrafThumbnail[];
}

export interface OgrafAction {
  id: string;
  name: string;
  description?: string;
  schema?: JSONSchema;
}

export interface OgrafActionDuration {
  type: "playAction" | "updateAction" | "stopAction" | "customAction";
  duration: number;
  customActionId?: string;
  steps?: { step: number; duration: number }[];
}

export interface OgrafRenderRequirement {
  resolution?: {
    width?: OgrafNumberConstraint;
    height?: OgrafNumberConstraint;
  };
  frameRate?: OgrafNumberConstraint;
  accessToPublicInternet?: OgrafBooleanConstraint;
  engine?: OgrafEngineRequirement[];
}

export interface OgrafNumberConstraint {
  max?: number;
  min?: number;
  exact?: number;
  ideal?: number;
}

export interface OgrafStringConstraint {
  exact?: string;
  ideal?: string | string[];
}

export interface OgrafBooleanConstraint {
  exact?: boolean;
  ideal?: boolean;
}

export interface OgrafEngineRequirement {
  name: string;
  version?: string;
}

export interface OgrafThumbnail {
  file: string;
  resolution?: { width: number; height: number };
}

// Preset resolutions
export const RESOLUTIONS: Resolution[] = [
  { width: 1280, height: 720, label: "HD" },
  { width: 1920, height: 1080, label: "Full HD" },
  { width: 3840, height: 2160, label: "4K" },
];

export const DEFAULT_RESOLUTION: Resolution = {
  width: 1920,
  height: 1080,
  label: "Full HD",
};

// Factory: create a new empty project
export function createEmptyProject(name = "Nouveau projet"): OgrafProject {
  return {
    id: crypto.randomUUID(),
    name,
    version: "1.0.0",
    resolution: { ...DEFAULT_RESOLUTION },
    supportsRealTime: true,
    supportsNonRealTime: false,
    stepCount: 1,
    elements: [],
    keyframes: [],
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Name",
          default: "John Doe",
        },
      },
    },
    defaultData: { name: "John Doe" },
    updatedAt: Date.now(),
  };
}

// Factory: create a default text element (lower third style)
export function createTextElement(name = "Texte"): TextGraphicElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    name,
    x: 50,
    y: 80,
    width: 400,
    height: 60,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    properties: {
      content: "John Doe",
      fontFamily: "Inter, sans-serif",
      fontSize: 32,
      fontWeight: "600",
      fontStyle: "normal",
      color: "#ffffff",
      textAlign: "left",
      lineHeight: 1.2,
      letterSpacing: 0,
    },
  };
}

// Factory: create a default shape element
export function createShapeElement(name = "Forme"): ShapeGraphicElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    name,
    x: 40,
    y: 75,
    width: 500,
    height: 80,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    properties: {
      shapeType: "rounded-rect",
      fillColor: "#1a1a2e",
      strokeColor: "#4a90d9",
      strokeWidth: 2,
      borderRadius: 8,
    },
  };
}
