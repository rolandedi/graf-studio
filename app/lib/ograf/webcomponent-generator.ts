import type {
  OgrafProject,
  GraphicElement,
  KeyframeTrack,
  Keyframe,
} from "./types";

/**
 * Converts an easing type to a CSS cubic-bezier or easing string
 * suitable for Web Animations API.
 */
function easingToCss(keyframe: Keyframe): string {
  switch (keyframe.easing) {
    case "linear":
      return "linear";
    case "ease-in":
      return "cubic-bezier(0.42, 0, 1, 1)";
    case "ease-out":
      return "cubic-bezier(0, 0, 0.58, 1)";
    case "ease-in-out":
      return "cubic-bezier(0.42, 0, 0.58, 1)";
    case "cubic-bezier":
      if (keyframe.cubicBezier) {
        const [x1, y1, x2, y2] = keyframe.cubicBezier;
        return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
      }
      return "linear";
    default:
      return "linear";
  }
}

/**
 * Builds a WAAPI keyframe array from a KeyframeTrack for a given CSS property.
 */
function buildWAAPIKeyframes(
  track: KeyframeTrack,
  cssProperty: string,
): Keyframe[] | null {
  if (track.keyframes.length === 0) return null;

  const sorted = [...track.keyframes].sort((a, b) => a.time - b.time);
  return sorted.map((kf) => ({
    [cssProperty]: kf.value,
    offset: kf.time / 1000, // Convert ms to seconds for offset (0-1)
    easing: easingToCss(kf),
  })) as Keyframe[];
}

/**
 * Maps a GrafStudio property name to a CSS property.
 */
function propertyToCss(property: string): string | null {
  const map: Record<string, string> = {
    x: "transform",
    y: "transform",
    opacity: "opacity",
    rotation: "transform",
    width: "width",
    height: "height",
  };
  return map[property] ?? null;
}

/**
 * Generates the style string for an element's initial state.
 */
function elementStyle(el: GraphicElement): string {
  const base = `
    position: absolute;
    left: ${el.x}px;
    top: ${el.y}px;
    width: ${el.width}px;
    height: ${el.height}px;
    opacity: ${el.opacity};
    transform: rotate(${el.rotation}deg);
    z-index: ${el.zIndex};
    box-sizing: border-box;
  `;

  if (el.type === "text") {
    const p = el.properties as GraphicElement["properties"] & {
      content: string;
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
      fontStyle: string;
      color: string;
      textAlign: string;
      lineHeight: number;
      letterSpacing: number;
    };
    return (
      base +
      `
      display: flex;
      align-items: center;
      font-family: ${p.fontFamily};
      font-size: ${p.fontSize}px;
      font-weight: ${p.fontWeight};
      font-style: ${p.fontStyle};
      color: ${p.color};
      text-align: ${p.textAlign};
      line-height: ${p.lineHeight};
      letter-spacing: ${p.letterSpacing}px;
      white-space: pre-wrap;
      overflow: hidden;
    `
    );
  }

  if (el.type === "shape") {
    const p = el.properties as GraphicElement["properties"] & {
      shapeType: string;
      fillColor: string;
      strokeColor: string;
      strokeWidth: number;
      borderRadius: number;
    };
    const radius = getShapeRadius(p.shapeType, p.borderRadius);
    return (
      base +
      `
      background: ${p.fillColor};
      border: ${p.strokeWidth}px solid ${p.strokeColor};
      border-radius: ${radius};
    `
    );
  }

  if (el.type === "image") {
    const p = el.properties as GraphicElement["properties"] & {
      src: string;
      objectFit: string;
    };
    return (
      base +
      `
      background-image: url("${p.src}");
      background-size: ${p.objectFit};
      background-position: center;
      background-repeat: no-repeat;
    `
    );
  }

  return base;
}

/**
 * Generates the inner HTML content for an element.
 */
function elementContent(el: GraphicElement): string {
  if (el.type === "text") {
    const p = el.properties as GraphicElement["properties"] & {
      content: string;
    };
    return escapeHtml(p.content);
  }
  return "";
}

function getShapeRadius(shapeType: string, borderRadius: number): string {
  if (shapeType === "circle") return "50%";
  if (shapeType === "rounded-rect") return `${borderRadius}px`;
  return "0";
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Generates the complete Web Component JavaScript code for an OGraf graphic.
 * The output is a standalone ES module that exports a class extending HTMLElement.
 */
export function generateWebComponent(project: OgrafProject): string {
  const elements = project.elements;
  const keyframeTracks = project.keyframes;

  // Build element creation code
  const elementsCode = elements
    .map((el) => {
      const style = elementStyle(el).replace(/\s+/g, " ").trim();
      const content = elementContent(el);
      return `    this._createElement("${el.id}", "${el.type}", ${JSON.stringify(style)}, ${JSON.stringify(content)});`;
    })
    .join("\n");

  // Build animation tracks code
  const tracksCode = keyframeTracks
    .map((track) => {
      const cssProp = propertyToCss(track.property);
      if (!cssProp) return "";
      const kf = buildWAAPIKeyframes(track, cssProp);
      if (!kf) return "";
      return `    this._addAnimation("${track.elementId}", ${JSON.stringify(kf)});`;
    })
    .filter(Boolean)
    .join("\n");

  // Build data binding map: which schema property maps to which element+attribute
  const dataBindings = buildDataBindings(project);

  return `// Auto-generated by GrafStudio — OGraf v1 compliant Web Component
class Graphic extends HTMLElement {
  constructor() {
    super();
    this._elements = new Map();
    this._animations = [];
    this._data = {};
    this._currentStep = undefined;
    this._shadow = null;
  }

  _createElement(id, type, style, content) {
    const el = document.createElement("div");
    el.setAttribute("data-element-id", id);
    el.setAttribute("data-element-type", type);
    el.style.cssText = style;
    if (content) el.textContent = content;
    this._elements.set(id, el);
    this.appendChild(el);
  }

  _addAnimation(elementId, keyframes) {
    this._animations.push({ elementId, keyframes });
  }

  _applyData(data) {
    this._data = { ...this._data, ...data };
    const bindings = ${JSON.stringify(dataBindings)};
    for (const binding of bindings) {
      const el = this._elements.get(binding.elementId);
      if (!el) continue;
      const value = this._data[binding.schemaKey];
      if (value === undefined) continue;
      if (binding.attribute === "content") {
        el.textContent = String(value);
      } else if (binding.attribute === "color") {
        el.style.color = String(value);
      } else if (binding.attribute === "fillColor") {
        el.style.background = String(value);
      } else if (binding.attribute === "fontSize") {
        el.style.fontSize = String(value) + "px";
      }
    }
  }

  async load({ data, renderType, renderCharacteristics }) {
    this._renderType = renderType;
    this._renderCharacteristics = renderCharacteristics;
${elementsCode}
    if (data) this._applyData(data);
    return { statusCode: 200 };
  }

  async dispose() {
    this._animations = [];
    this._elements.clear();
    this.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction({ delta, goto, skipAnimation }) {
    if (skipAnimation) {
      this._currentStep = goto !== undefined ? goto : (this._currentStep ?? -1) + (delta ?? 1);
      return { statusCode: 200, currentStep: this._currentStep };
    }
${tracksCode}
    // Run animations via WAAPI
    const promises = [];
    for (const anim of this._animations) {
      const el = this._elements.get(anim.elementId);
      if (!el) continue;
      const totalDuration = Math.max(...anim.keyframes.map(k => (k.offset || 0) * 1000));
      const animation = el.animate(anim.keyframes, {
        duration: totalDuration > 0 ? totalDuration : 500,
        fill: "forwards",
        easing: "linear",
      });
      promises.push(animation.finished);
    }
    await Promise.all(promises).catch(() => {});
    this._currentStep = goto !== undefined ? goto : (this._currentStep ?? -1) + (delta ?? 1);
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction({ skipAnimation }) {
    if (skipAnimation) {
      this.innerHTML = "";
      this._elements.clear();
      return { statusCode: 200 };
    }
    // Animate out: fade all elements
    const promises = [];
    for (const [id, el] of this._elements) {
      const animation = el.animate(
        [{ opacity: el.style.opacity || 1 }, { opacity: 0 }],
        { duration: 300, fill: "forwards" }
      );
      promises.push(animation.finished);
    }
    await Promise.all(promises).catch(() => {});
    this.innerHTML = "";
    this._elements.clear();
    return { statusCode: 200 };
  }

  async updateAction({ data, skipAnimation }) {
    if (data) this._applyData(data);
    return { statusCode: 200 };
  }

  async customAction({ id, payload, skipAnimation }) {
    return { statusCode: 400, statusMessage: "No custom actions supported" };
  }
}

export default Graphic;
`;
}

interface DataBinding {
  elementId: string;
  schemaKey: string;
  attribute: string;
}

/**
 * Builds data bindings from element names matching schema property names.
 * For V1, we bind text elements whose name matches a schema property key.
 */
function buildDataBindings(project: OgrafProject): DataBinding[] {
  const bindings: DataBinding[] = [];
  if (!project.schema.properties) return bindings;

  const schemaKeys = Object.keys(project.schema.properties);

  for (const el of project.elements) {
    if (el.type === "text") {
      // Match by element name to schema key
      const match = schemaKeys.find(
        (key) => key.toLowerCase() === el.name.toLowerCase(),
      );
      if (match) {
        bindings.push({
          elementId: el.id,
          schemaKey: match,
          attribute: "content",
        });
      }
    }
  }

  return bindings;
}

/**
 * Generates the HTML wrapper that loads the Web Component and exposes
 * a postMessage API for the parent window to control the graphic.
 */
export function generateWrapperHTML(
  project: OgrafProject,
  componentCode: string,
): string {
  const defaultData = JSON.stringify(project.defaultData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${project.resolution.width}px; height: ${project.resolution.height}px; overflow: hidden; background: transparent; }
    body { position: relative; }
  </style>
</head>
<body>
  <script type="module">
    ${componentCode}

    const graphic = new Graphic();
    customElements.define("ograf-graphic", Graphic);
    document.body.appendChild(graphic);

    const defaultData = ${defaultData};

    // Notify parent that we're ready
    window.parent.postMessage({ type: "ograf:ready" }, location.origin);

    // Listen for commands from parent
    window.addEventListener("message", async (event) => {
      const { type, requestId, ...params } = event.data;
      if (!type || !type.startsWith("ograf:")) return;

      try {
        let result;
        switch (type) {
          case "ograf:load":
            result = await graphic.load({
              data: params.data ?? defaultData,
              renderType: params.renderType ?? "realtime",
              renderCharacteristics: params.renderCharacteristics ?? {},
            });
            break;
          case "ograf:playAction":
            result = await graphic.playAction(params);
            break;
          case "ograf:stopAction":
            result = await graphic.stopAction(params);
            break;
          case "ograf:updateAction":
            result = await graphic.updateAction(params);
            break;
          case "ograf:dispose":
            result = await graphic.dispose();
            break;
          default:
            result = { statusCode: 400, statusMessage: "Unknown command: " + type };
        }
        window.parent.postMessage({
          type: "ograf:response",
          requestId,
          statusCode: result?.statusCode ?? 200,
          statusMessage: result?.statusMessage,
          currentStep: result?.currentStep,
          result: result?.result,
        }, location.origin);
      } catch (err) {
        window.parent.postMessage({
          type: "ograf:error",
          requestId,
          error: err.message || String(err),
        }, location.origin);
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Creates a Blob URL for the complete OGraf graphic (HTML wrapper + component).
 */
export function createGraphicBlobURL(project: OgrafProject): string {
  const componentCode = generateWebComponent(project);
  const html = generateWrapperHTML(project, componentCode);
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}
