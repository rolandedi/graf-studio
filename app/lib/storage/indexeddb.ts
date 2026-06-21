import type { OgrafProject } from "../ograf/types";

const DB_NAME = "grafstudio";
const DB_VERSION = 1;
const STORE_NAME = "projects";

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

export async function getAllProjects(): Promise<OgrafProject[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(db, "readonly").getAll();
    request.onsuccess = () => resolve(request.result as OgrafProject[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getProject(
  id: string,
): Promise<OgrafProject | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(db, "readonly").get(id);
    request.onsuccess = () =>
      resolve(request.result as OgrafProject | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: OgrafProject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(db, "readwrite").put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(db, "readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportProjectJSON(id: string): Promise<string> {
  const project = await getProject(id);
  if (!project) throw new Error(`Project ${id} not found`);
  return JSON.stringify(project, null, 2);
}

export async function importProjectJSON(json: string): Promise<OgrafProject> {
  const project = JSON.parse(json) as OgrafProject;
  project.updatedAt = Date.now();
  await saveProject(project);
  return project;
}
