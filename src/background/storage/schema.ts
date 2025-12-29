import type { MemoryEntry, StorageSchema } from '../../shared/types';

export const memoryEntrySchema: StorageSchema<MemoryEntry> = {
  name: 'memory_entries',
  primaryKey: 'id',
  fields: {
    id: { type: 'string' },
    question_text: { type: 'string' },
    answer_text: { type: 'string' },
    answer_type: { type: 'string' },
    meta: { type: 'object' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    last_used_at: { type: 'string', optional: true },
    usage_count: { type: 'number' },
  },
};
