import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { MemoryDatabaseSchema, MemoryStoreName } from '../../shared/types';

const DB_NAME = 'jobfill';
const DB_VERSION = 1;
const MEMORY_STORE: MemoryStoreName = 'memory_entries';

let dbPromise: Promise<IDBPDatabase<MemoryDatabaseSchema>> | null = null;

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<MemoryDatabaseSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(MEMORY_STORE)) {
          const store = db.createObjectStore(MEMORY_STORE, { keyPath: 'id' });
          store.createIndex('by_domain', 'meta.domain');
          store.createIndex('by_answer_type', 'answer_type');
          store.createIndex('by_updated_at', 'updated_at');
        }
      },
    });
  }

  return dbPromise;
};

export const memoryStoreName = MEMORY_STORE;
