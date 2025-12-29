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
  MemoryEntry,
} from '../shared/types';
import {
  getMemoryEntry,
  listMemoryEntries,
  createMemoryEntry,
  updateMemoryEntry,
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
    default:
      return null;
  }
};
