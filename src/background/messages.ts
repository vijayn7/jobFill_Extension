import type { RequestMessage, ResponseMessage } from '../shared/types';

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

export type BackgroundMessage = RequestMessage;
export type BackgroundResponse = ResponseMessage;
