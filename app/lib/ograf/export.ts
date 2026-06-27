import JSZip from "jszip";
import type { OgrafProject } from "../ograf/types";
import { buildManifest, serializeManifest } from "../ograf/manifest-builder";
import { generateWebComponent } from "../ograf/webcomponent-generator";

/**
 * Exports a GrafStudio project as a ZIP file containing
 * a valid OGraf v1 graphic package.
 *
 * Structure:
 *   manifest.ograf.json
 *   graphic.mjs
 *   assets/ (empty for V1)
 */
export async function exportProjectZip(project: OgrafProject): Promise<Blob> {
  const zip = new JSZip();

  // Generate manifest
  const manifest = buildManifest(project);
  zip.file("manifest.ograf.json", serializeManifest(manifest));

  // Generate Web Component
  const componentCode = generateWebComponent(project);
  zip.file("graphic.mjs", componentCode);

  // Create empty assets folder
  zip.folder("assets");

  return zip.generateAsync({ type: "blob" });
}

/**
 * Triggers a download of the project ZIP file.
 */
export async function downloadProjectZip(project: OgrafProject): Promise<void> {
  const blob = await exportProjectZip(project);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.ograf.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports the project as a single JSON file (GrafStudio format).
 */
export function exportProjectJSON(project: OgrafProject): void {
  const raw = JSON.parse(JSON.stringify(project));
  const blob = new Blob([JSON.stringify(raw, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.grafstudio.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
