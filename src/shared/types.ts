import type { DBSchema } from 'idb';

export interface FieldContext {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  question_text?: string;
  section_heading?: string;
  nearby_text?: string;
  placeholder?: string;
  required?: boolean;
  maxlength?: number;
  pattern?: string;
  input_type?: string;
  select_options?: string[];
  url?: string;
  domain?: string;
  page_title?: string;
}

export type SensitiveFieldType = 'ssn' | 'dob' | 'passport' | 'bank' | 'tax_id';

export type SensitiveHandling = 'block' | 'warn_only';

export interface SensitiveFieldDetection {
  isSensitive: boolean;
  matches: SensitiveFieldType[];
}

export interface ExtensionSettings {
  sensitiveHandling: SensitiveHandling;
}

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLElement;

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

export type MemoryStoreName = 'memory_entries';

export interface MemoryDatabaseSchema extends DBSchema {
  memory_entries: {
    key: string;
    value: MemoryEntry;
    indexes: {
      by_domain: string;
      by_answer_type: string;
      by_updated_at: string;
    };
  };
}

export interface ListMemoryEntriesOptions {
  domain?: string;
  answerType?: string;
  limit?: number;
}

export interface FieldFocusedPayload {
  field: FieldContext;
}

export interface SuggestionsPayload {
  suggestions: MemoryEntry[];
}

export interface SaveAnswerPayload {
  field: FieldContext;
  value: string;
}

export interface MarkUsedPayload {
  entryId: string;
}

export interface ListEntriesPayload {
  entries: MemoryEntry[];
}

export interface UpdateEntryPayload {
  entryId: string;
  value: string;
}

export interface DeleteEntryPayload {
  entryId: string;
}

export interface ExportJsonPayload {
  json: string;
}

export interface ImportJsonPayload {
  json: string;
}

export interface PingRequest {
  type: 'PING';
}

export interface PingResponse {
  type: 'PING';
  ok: true;
}

export interface FieldFocusedRequest {
  type: 'FIELD_FOCUSED';
  payload: FieldFocusedPayload;
}

export interface FieldFocusedResponse {
  type: 'FIELD_FOCUSED';
  acknowledged: true;
}

export interface GetSuggestionsRequest {
  type: 'GET_SUGGESTIONS';
  payload: {
    field: FieldContext;
    limit?: number;
  };
}

export interface GetSuggestionsResponse {
  type: 'GET_SUGGESTIONS';
  payload: SuggestionsPayload;
}

export interface SaveAnswerRequest {
  type: 'SAVE_ANSWER';
  payload: SaveAnswerPayload;
}

export interface SaveAnswerResponse {
  type: 'SAVE_ANSWER';
  payload: {
    entry: MemoryEntry;
  };
}

export interface MarkUsedRequest {
  type: 'MARK_USED';
  payload: MarkUsedPayload;
}

export interface MarkUsedResponse {
  type: 'MARK_USED';
  acknowledged: true;
}

export interface ListEntriesRequest {
  type: 'LIST_ENTRIES';
}

export interface ListEntriesResponse {
  type: 'LIST_ENTRIES';
  payload: ListEntriesPayload;
}

export interface UpdateEntryRequest {
  type: 'UPDATE_ENTRY';
  payload: UpdateEntryPayload;
}

export interface UpdateEntryResponse {
  type: 'UPDATE_ENTRY';
  payload: {
    entry: MemoryEntry;
  };
}

export interface DeleteEntryRequest {
  type: 'DELETE_ENTRY';
  payload: DeleteEntryPayload;
}

export interface DeleteEntryResponse {
  type: 'DELETE_ENTRY';
  acknowledged: true;
}

export interface ExportJsonRequest {
  type: 'EXPORT_JSON';
}

export interface ExportJsonResponse {
  type: 'EXPORT_JSON';
  payload: ExportJsonPayload;
}

export interface ImportJsonRequest {
  type: 'IMPORT_JSON';
  payload: ImportJsonPayload;
}

export interface ImportJsonResponse {
  type: 'IMPORT_JSON';
  acknowledged: true;
}

export type RequestMessage =
  | PingRequest
  | FieldFocusedRequest
  | GetSuggestionsRequest
  | SaveAnswerRequest
  | MarkUsedRequest
  | ListEntriesRequest
  | UpdateEntryRequest
  | DeleteEntryRequest
  | ExportJsonRequest
  | ImportJsonRequest;

export type ResponseMessage =
  | PingResponse
  | FieldFocusedResponse
  | GetSuggestionsResponse
  | SaveAnswerResponse
  | MarkUsedResponse
  | ListEntriesResponse
  | UpdateEntryResponse
  | DeleteEntryResponse
  | ExportJsonResponse
  | ImportJsonResponse;

export type MessageRequestMap = {
  PING: PingRequest;
  FIELD_FOCUSED: FieldFocusedRequest;
  GET_SUGGESTIONS: GetSuggestionsRequest;
  SAVE_ANSWER: SaveAnswerRequest;
  MARK_USED: MarkUsedRequest;
  LIST_ENTRIES: ListEntriesRequest;
  UPDATE_ENTRY: UpdateEntryRequest;
  DELETE_ENTRY: DeleteEntryRequest;
  EXPORT_JSON: ExportJsonRequest;
  IMPORT_JSON: ImportJsonRequest;
};

export type MessageResponseMap = {
  PING: PingResponse;
  FIELD_FOCUSED: FieldFocusedResponse;
  GET_SUGGESTIONS: GetSuggestionsResponse;
  SAVE_ANSWER: SaveAnswerResponse;
  MARK_USED: MarkUsedResponse;
  LIST_ENTRIES: ListEntriesResponse;
  UPDATE_ENTRY: UpdateEntryResponse;
  DELETE_ENTRY: DeleteEntryResponse;
  EXPORT_JSON: ExportJsonResponse;
  IMPORT_JSON: ImportJsonResponse;
};

export type MessageRequestFor<T extends keyof MessageRequestMap> = MessageRequestMap[T];
export type MessageResponseFor<T extends keyof MessageResponseMap> = MessageResponseMap[T];
