import type {
  EmbeddingVector,
  EmbeddingsEndpointRequest,
  EmbeddingsEndpointResponse,
  FieldContext,
  SuggestionEntry,
} from '../../shared/types';
import { buildSearchText } from './normalize';

const DEFAULT_TIMEOUT_MS = 1800;

const buildQueryText = (context: FieldContext): string => {
  return buildSearchText([
    context.question_text,
    context.label,
    context.name,
    context.placeholder,
    context.section_heading,
    context.nearby_text,
  ]);
};

const buildEntryText = (entry: SuggestionEntry): string => {
  return buildSearchText([
    entry.question_text,
    entry.meta.section,
    entry.meta.field_type,
  ]);
};

const extractEmbeddings = (payload: EmbeddingsEndpointResponse): EmbeddingVector[] | null => {
  if (Array.isArray(payload.embeddings)) {
    return payload.embeddings;
  }
  if (Array.isArray(payload.vectors)) {
    return payload.vectors;
  }
  return null;
};

const fetchEmbeddings = async (
  endpoint: string,
  inputs: string[],
): Promise<EmbeddingVector[] | null> => {
  if (!endpoint) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const requestBody: EmbeddingsEndpointRequest = { inputs };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as EmbeddingsEndpointResponse;
    return extractEmbeddings(data);
  } catch (error) {
    console.warn('JobFill embeddings request failed', error);
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

const cosineSimilarity = (a: EmbeddingVector, b: EmbeddingVector): number => {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const valueA = a[i];
    const valueB = b[i];
    dot += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const normalizeCosine = (value: number): number => {
  const normalized = (value + 1) / 2;
  return Math.max(0, Math.min(1, normalized));
};

export const rankSuggestionsWithEmbeddings = async (
  context: FieldContext,
  suggestions: SuggestionEntry[],
  endpoint: string,
): Promise<SuggestionEntry[]> => {
  if (!endpoint || suggestions.length === 0) {
    return suggestions;
  }

  const queryText = buildQueryText(context);
  const entryTexts = suggestions.map((entry) => buildEntryText(entry));
  const inputs = [queryText, ...entryTexts];

  const embeddings = await fetchEmbeddings(endpoint, inputs);
  if (!embeddings || embeddings.length !== inputs.length) {
    return suggestions;
  }

  const [queryEmbedding, ...entryEmbeddings] = embeddings;

  const combined = suggestions.map((entry, index) => {
    const embedding = entryEmbeddings[index] ?? [];
    const similarity = normalizeCosine(cosineSimilarity(queryEmbedding, embedding));
    const blendedScore = entry.score * 0.65 + similarity * 0.35;

    return {
      ...entry,
      score: blendedScore,
    };
  });

  return combined.sort((a, b) => b.score - a.score);
};
