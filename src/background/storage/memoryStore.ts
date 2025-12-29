import type { MemoryEntry, ListMemoryEntriesOptions } from '../../shared/types';
import { getDb, memoryStoreName } from './db';

export const createMemoryEntry = async (entry: MemoryEntry): Promise<MemoryEntry> => {
  const db = await getDb();
  await db.add(memoryStoreName, entry);
  return entry;
};

export const getMemoryEntry = async (id: string): Promise<MemoryEntry | undefined> => {
  const db = await getDb();
  return db.get(memoryStoreName, id);
};

export const updateMemoryEntry = async (
  id: string,
  updates: Partial<MemoryEntry>,
): Promise<MemoryEntry | null> => {
  const db = await getDb();
  const existing = await db.get(memoryStoreName, id);

  if (!existing) {
    return null;
  }

  const updated: MemoryEntry = { ...existing, ...updates };
  await db.put(memoryStoreName, updated);
  return updated;
};

export const deleteMemoryEntry = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete(memoryStoreName, id);
};

const sortByUpdatedAtDesc = (entries: MemoryEntry[]) =>
  [...entries].sort((a, b) => b.updated_at.localeCompare(a.updated_at));

export const listMemoryEntries = async (
  options: ListMemoryEntriesOptions = {},
): Promise<MemoryEntry[]> => {
  const db = await getDb();
  const { domain, answerType, limit } = options;

  if (domain) {
    const entries = await db.getAllFromIndex(memoryStoreName, 'by_domain', domain, limit);
    return answerType ? entries.filter((entry) => entry.answer_type === answerType) : entries;
  }

  if (answerType) {
    const entries = await db.getAllFromIndex(
      memoryStoreName,
      'by_answer_type',
      answerType,
      limit,
    );
    return entries;
  }

  const entries = await db.getAllFromIndex(memoryStoreName, 'by_updated_at');
  const sorted = sortByUpdatedAtDesc(entries);
  return limit ? sorted.slice(0, limit) : sorted;
};
