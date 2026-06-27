import type { OgrafProject } from "./types";
import {
  getAllProjects,
  getProject,
  saveProject,
  deleteProject as dbDeleteProject,
} from "../storage/indexeddb";

/**
 * Abstracts project persistence so the store and tests do not depend
 * directly on IndexedDB.
 */
export interface ProjectRepository {
  getAll(): Promise<OgrafProject[]>;
  get(id: string): Promise<OgrafProject | undefined>;
  save(project: OgrafProject): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Production implementation backed by the browser's IndexedDB.
 */
export class IndexedDbProjectRepository implements ProjectRepository {
  async getAll(): Promise<OgrafProject[]> {
    return getAllProjects();
  }

  async get(id: string): Promise<OgrafProject | undefined> {
    return getProject(id);
  }

  async save(project: OgrafProject): Promise<void> {
    return saveProject(project);
  }

  async delete(id: string): Promise<void> {
    return dbDeleteProject(id);
  }
}

/**
 * In-memory implementation useful for tests and ephemeral sessions.
 */
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, OgrafProject>();

  async getAll(): Promise<OgrafProject[]> {
    return [...this.projects.values()];
  }

  async get(id: string): Promise<OgrafProject | undefined> {
    return this.projects.get(id);
  }

  async save(project: OgrafProject): Promise<void> {
    this.projects.set(project.id, { ...project });
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }
}

/**
 * Shared singleton for the application. Replace with InMemoryProjectRepository
 * in tests.
 */
export const projectRepository: ProjectRepository =
  new IndexedDbProjectRepository();
