import { MessageType } from '../messages';
import type { MemoryEntry, SaveAnswerRequest, SaveAnswerResponse } from '../../shared/types';
import { createMemoryEntry, listMemoryEntries, updateMemoryEntry } from '../storage/memoryStore';
import { jaccardSimilarity } from '../matching/lexical';
import { detectPlatform } from '../platform/detect';

const HIGH_SIMILARITY_THRESHOLD = 0.82;

const nowIso = (): string => new Date().toISOString();

const buildMeta = (request: SaveAnswerRequest): MemoryEntry['meta'] => {
  const field = request.payload.field;
  const platform = field.platform || detectPlatform(field.url ?? field.domain ?? '');
  return {
    domain: field.domain ?? 'unknown',
    platform,
    section: field.section_heading ?? 'General',
    field_type: field.input_type ?? 'text',
  };
};

const getQuestionText = (request: SaveAnswerRequest): string =>
  request.payload.field.question_text ||
  request.payload.field.label ||
  request.payload.field.placeholder ||
  'Untitled question';

const findSimilarEntry = async (
  domain: string,
  questionText: string,
): Promise<MemoryEntry | null> => {
  if (!questionText.trim()) {
    return null;
  }

  const entries = await listMemoryEntries({ domain });
  let bestMatch: MemoryEntry | null = null;
  let bestScore = 0;

  entries.forEach((entry) => {
    const score = jaccardSimilarity(entry.question_text, questionText);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  return bestScore >= HIGH_SIMILARITY_THRESHOLD ? bestMatch : null;
};

export const handleSaveAnswer = async (
  request: SaveAnswerRequest,
): Promise<SaveAnswerResponse> => {
  const now = nowIso();
  const questionText = getQuestionText(request);
  const domain = request.payload.field.domain ?? 'unknown';
  const existing = await findSimilarEntry(domain, questionText);

  if (existing) {
    const updated = await updateMemoryEntry(existing.id, {
      question_text: questionText,
      answer_text: request.payload.value,
      answer_type: request.payload.field.input_type ?? existing.answer_type,
      meta: buildMeta(request),
      updated_at: now,
      last_used_at: now,
      usage_count: existing.usage_count + 1,
    });

    return {
      type: MessageType.SAVE_ANSWER,
      payload: { entry: updated ?? existing },
    };
  }

  const entry: MemoryEntry = {
    id: crypto.randomUUID(),
    question_text: questionText,
    answer_text: request.payload.value,
    answer_type: request.payload.field.input_type ?? 'text',
    meta: buildMeta(request),
    created_at: now,
    updated_at: now,
    last_used_at: now,
    usage_count: 1,
  };

  const created = await createMemoryEntry(entry);

  return {
    type: MessageType.SAVE_ANSWER,
    payload: { entry: created },
  };
};
