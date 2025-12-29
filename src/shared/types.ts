export interface FieldContext {
  id?: string;
  label?: string;
  value?: string;
}

export type StorageFieldType = 'string' | 'number' | 'object';

export interface StorageFieldSchema {
  type: StorageFieldType;
  optional?: boolean;
}

export interface StorageSchema<T> {
  name: string;
  primaryKey: keyof T;
  fields: {
    [K in keyof T]: StorageFieldSchema;
  };
}

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntryMeta {
  domain: string;
  platform: string;
  section: string;
  field_type: string;
}

export interface MemoryEntry extends BaseRecord {
  question_text: string;
  answer_text: string;
  answer_type: string;
  meta: MemoryEntryMeta;
  last_used_at: string | null;
  usage_count: number;
}

export interface PingMessage {
  type: 'PING';
}

export interface PongMessage {
  type: 'PONG';
}
