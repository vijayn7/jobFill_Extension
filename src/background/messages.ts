import type {
  ExportJsonResult,
  FieldContext,
  ImportJsonPayload,
  MemoryEntry,
  MemoryEntryInput,
  MemoryEntryUpdate,
  Suggestion,
} from '../shared/types';

export enum MessageType {
  PING = 'PING',
  FIELD_FOCUSED = 'FIELD_FOCUSED',
  GET_SUGGESTIONS = 'GET_SUGGESTIONS',
  SAVE_ANSWER = 'SAVE_ANSWER',
  MARK_USED = 'MARK_USED',
  LIST_ENTRIES = 'LIST_ENTRIES',
  UPDATE_ENTRY = 'UPDATE_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  EXPORT_JSON = 'EXPORT_JSON',
  IMPORT_JSON = 'IMPORT_JSON',
}

export type MessageRequestMap = {
  [MessageType.PING]: { type: MessageType.PING };
  [MessageType.FIELD_FOCUSED]: {
    type: MessageType.FIELD_FOCUSED;
    payload: FieldContext;
  };
  [MessageType.GET_SUGGESTIONS]: {
    type: MessageType.GET_SUGGESTIONS;
    payload: FieldContext;
  };
  [MessageType.SAVE_ANSWER]: {
    type: MessageType.SAVE_ANSWER;
    payload: MemoryEntryInput;
  };
  [MessageType.MARK_USED]: {
    type: MessageType.MARK_USED;
    payload: { id: string };
  };
  [MessageType.LIST_ENTRIES]: { type: MessageType.LIST_ENTRIES };
  [MessageType.UPDATE_ENTRY]: {
    type: MessageType.UPDATE_ENTRY;
    payload: MemoryEntryUpdate;
  };
  [MessageType.DELETE_ENTRY]: {
    type: MessageType.DELETE_ENTRY;
    payload: { id: string };
  };
  [MessageType.EXPORT_JSON]: { type: MessageType.EXPORT_JSON };
  [MessageType.IMPORT_JSON]: {
    type: MessageType.IMPORT_JSON;
    payload: ImportJsonPayload;
  };
};

export type MessageResponseMap = {
  [MessageType.PING]: { ok: true };
  [MessageType.FIELD_FOCUSED]: { ok: true };
  [MessageType.GET_SUGGESTIONS]: { suggestions: Suggestion[] };
  [MessageType.SAVE_ANSWER]: { entry: MemoryEntry };
  [MessageType.MARK_USED]: { ok: true };
  [MessageType.LIST_ENTRIES]: { entries: MemoryEntry[] };
  [MessageType.UPDATE_ENTRY]: { entry: MemoryEntry };
  [MessageType.DELETE_ENTRY]: { ok: true };
  [MessageType.EXPORT_JSON]: ExportJsonResult;
  [MessageType.IMPORT_JSON]: { imported: number };
};

export type MessageRequest = MessageRequestMap[MessageType];
export type MessageResponse = MessageResponseMap[MessageType];

export const initializeBackground = (): void => {
  // Placeholder for message listeners.
};
