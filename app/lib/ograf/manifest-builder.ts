import type { OgrafProject, OgrafManifest } from "./types";

/**
 * Builds an OGraf v1 compliant manifest from a GrafStudio project.
 */
export function buildManifest(project: OgrafProject): OgrafManifest {
  return {
    $schema:
      "https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json",
    id: project.id,
    version: project.version,
    name: project.name,
    description: project.description,
    author: project.author,
    main: "graphic.mjs",
    schema: project.schema,
    supportsRealTime: project.supportsRealTime,
    supportsNonRealTime: project.supportsNonRealTime,
    stepCount: project.stepCount,
    renderRequirements: [
      {
        resolution: {
          width: { exact: project.resolution.width },
          height: { exact: project.resolution.height },
        },
      },
    ],
  };
}

/**
 * Serializes the manifest to a JSON string.
 */
export function serializeManifest(manifest: OgrafManifest): string {
  return JSON.stringify(manifest, null, 2);
}
