import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProjectRepository } from "./project-repository";
import { createEmptyProject } from "./types";

describe("InMemoryProjectRepository", () => {
  let repository: InMemoryProjectRepository;

  beforeEach(() => {
    repository = new InMemoryProjectRepository();
  });

  it("saves and retrieves a project", async () => {
    const project = createEmptyProject("Save test");
    await repository.save(project);

    const found = await repository.get(project.id);

    expect(found).toEqual(project);
  });

  it("lists all saved projects", async () => {
    const first = createEmptyProject("First");
    const second = createEmptyProject("Second");
    await repository.save(first);
    await repository.save(second);

    const all = await repository.getAll();

    expect(all).toHaveLength(2);
    expect(all.map((p) => p.name)).toContain("First");
    expect(all.map((p) => p.name)).toContain("Second");
  });

  it("deletes a project", async () => {
    const project = createEmptyProject("To delete");
    await repository.save(project);
    await repository.delete(project.id);

    const found = await repository.get(project.id);

    expect(found).toBeUndefined();
  });

  it("returns undefined for unknown project ids", async () => {
    const found = await repository.get("unknown-id");

    expect(found).toBeUndefined();
  });
});
