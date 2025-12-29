import type {
  BackgroundResponse,
  BackgroundMessage,
} from './messages';
import { MessageType } from './messages';
import type {
  GetSuggestionsRequest,
  GetSuggestionsResponse,
  MarkUsedRequest,
  MarkUsedResponse,
  SaveAnswerRequest,
  SaveAnswerResponse,
  ListEntriesResponse,
  UpdateEntryRequest,
  UpdateEntryResponse,
  DeleteEntryRequest,
  DeleteEntryResponse,
  ExportJsonResponse,
  ImportJsonRequest,
  ImportJsonResponse,
  MemoryEntry,
} from '../shared/types';
import {
  getMemoryEntry,
  listMemoryEntries,
  createMemoryEntry,
  updateMemoryEntry,
  deleteMemoryEntry,
  replaceMemoryEntries,
} from './storage/memoryStore';
import { scoreSuggestions } from './matching/scoring';
import { getCachedSuggestions, setCachedSuggestions, clearCachedSuggestions } from './matching/cache';

const DEFAULT_SUGGESTION_LIMIT = 5;

const getQuestionText = (field: GetSuggestionsRequest['payload']['field']): string => {
  return (
    field.question_text ||
    field.label ||
    field.name ||
    field.placeholder ||
    'Unknown question'
  );
};

const buildMemoryEntry = (request: SaveAnswerRequest): MemoryEntry => {
  const now = new Date().toISOString();
  const { field, value } = request.payload;
  const questionText = getQuestionText(field);

  return {
    id: crypto.randomUUID(),
    question_text: questionText,
    answer_text: value,
    answer_type: field.input_type ?? 'text',
    meta: {
      domain: field.domain ?? 'unknown',
      platform: field.domain ?? 'unknown',
      section: field.section_heading ?? 'general',
      field_type: field.input_type ?? 'text',
    },
    created_at: now,
    updated_at: now,
    last_used_at: null,
    usage_count: 0,
  };
};

const handleGetSuggestions = async (
  request: GetSuggestionsRequest,
  tabId?: number,
): Promise<GetSuggestionsResponse> => {
  if (tabId !== undefined) {
    const cached = getCachedSuggestions(tabId);
    if (cached) {
      return {
        type: MessageType.GET_SUGGESTIONS,
        payload: { suggestions: cached },
      };
    }
  }

  const context = request.payload.field;
  const entries = await listMemoryEntries({
    domain: context.domain,
  });

  const scored = scoreSuggestions(context, entries);
  const limit = request.payload.limit ?? DEFAULT_SUGGESTION_LIMIT;
  const limited = scored.slice(0, limit);

  if (tabId !== undefined) {
    setCachedSuggestions(tabId, limited);
  }

  return {
    type: MessageType.GET_SUGGESTIONS,
    payload: { suggestions: limited },
  };
};

const handleSaveAnswer = async (
  request: SaveAnswerRequest,
  tabId?: number,
): Promise<SaveAnswerResponse> => {
  const entry = buildMemoryEntry(request);
  const saved = await createMemoryEntry(entry);

  if (tabId !== undefined) {
    clearCachedSuggestions(tabId);
  }

  return {
    type: MessageType.SAVE_ANSWER,
    payload: { entry: saved },
  };
};

const handleMarkUsed = async (request: MarkUsedRequest): Promise<MarkUsedResponse> => {
  const now = new Date().toISOString();
  const existing = await getMemoryEntry(request.payload.entryId);

  if (existing) {
    await updateMemoryEntry(existing.id, {
      usage_count: existing.usage_count + 1,
      last_used_at: now,
      updated_at: now,
    });
  }

  return {
    type: MessageType.MARK_USED,
    acknowledged: true,
  };
};

const handleListEntries = async (): Promise<ListEntriesResponse> => {
  const entries = await listMemoryEntries();
  return {
    type: MessageType.LIST_ENTRIES,
    payload: { entries },
  };
};

const handleUpdateEntry = async (
  request: UpdateEntryRequest,
): Promise<UpdateEntryResponse> => {
  const now = new Date().toISOString();
  const updated = await updateMemoryEntry(request.payload.entryId, {
    answer_text: request.payload.value,
    updated_at: now,
  });

  if (!updated) {
    throw new Error('Entry not found.');
  }

  return {
    type: MessageType.UPDATE_ENTRY,
    payload: { entry: updated },
  };
};

const handleDeleteEntry = async (
  request: DeleteEntryRequest,
): Promise<DeleteEntryResponse> => {
  await deleteMemoryEntry(request.payload.entryId);
  return {
    type: MessageType.DELETE_ENTRY,
    acknowledged: true,
  };
};

const handleExportJson = async (): Promise<ExportJsonResponse> => {
  const entries = await listMemoryEntries();
  return {
    type: MessageType.EXPORT_JSON,
    payload: {
      json: JSON.stringify(entries, null, 2),
    },
  };
};

const parseImportJson = (json: string): MemoryEntry[] => {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Import data must be an array.');
  }

  const entries = parsed.filter((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }
    const candidate = entry as MemoryEntry;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.question_text === 'string' &&
      typeof candidate.answer_text === 'string' &&
      typeof candidate.answer_type === 'string' &&
      typeof candidate.created_at === 'string' &&
      typeof candidate.updated_at === 'string' &&
      typeof candidate.usage_count === 'number' &&
      typeof candidate.meta?.domain === 'string' &&
      typeof candidate.meta?.platform === 'string' &&
      typeof candidate.meta?.section === 'string' &&
      typeof candidate.meta?.field_type === 'string'
    );
  });

  return entries as MemoryEntry[];
};

const handleImportJson = async (
  request: ImportJsonRequest,
): Promise<ImportJsonResponse> => {
  const entries = parseImportJson(request.payload.json);
  await replaceMemoryEntries(entries);
  return {
    type: MessageType.IMPORT_JSON,
    acknowledged: true,
  };
};

export const handleBackgroundMessage = async (
  message: BackgroundMessage,
  tabId?: number,
): Promise<BackgroundResponse | null> => {
  switch (message.type) {
    case MessageType.PING:
      return { type: MessageType.PING, ok: true };
    case MessageType.GET_SUGGESTIONS:
      return handleGetSuggestions(message, tabId);
    case MessageType.SAVE_ANSWER:
      return handleSaveAnswer(message, tabId);
    case MessageType.MARK_USED:
      return handleMarkUsed(message);
    case MessageType.LIST_ENTRIES:
      return handleListEntries();
    case MessageType.UPDATE_ENTRY:
      return handleUpdateEntry(message);
    case MessageType.DELETE_ENTRY:
      return handleDeleteEntry(message);
    case MessageType.EXPORT_JSON:
      return handleExportJson();
    case MessageType.IMPORT_JSON:
      return handleImportJson(message);
    default:
      return null;
  }
};
