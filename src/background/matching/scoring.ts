import type { FieldContext, MemoryEntry, SuggestionEntry } from '../../shared/types';
import { buildQueryTokens, jaccardSimilarity, trigramSimilarity } from './lexical';
import { buildSearchText } from './normalize';

const scoreForEntry = (query: ReturnType<typeof buildQueryTokens>, entry: MemoryEntry): number => {
  const entryText = buildSearchText([
    entry.question_text,
    entry.meta.section,
    entry.meta.field_type,
  ]);

  const entryTokens = buildQueryTokens([entry.question_text, entry.meta.section]).tokens;
  const jaccard = jaccardSimilarity(query.tokens, entryTokens);
  const trigram = trigramSimilarity(query.text, entryText);
  const lengthDelta = Math.abs(query.text.length - entryText.length);

  let score = jaccard * 0.55 + trigram * 0.45;

  if (entry.question_text && query.text.includes(buildSearchText([entry.question_text]))) {
    score += 0.08;
  }

  if (entry.meta.section && query.text.includes(entry.meta.section.toLowerCase())) {
    score += 0.04;
  }

  if (entry.meta.field_type && query.text.includes(entry.meta.field_type.toLowerCase())) {
    score += 0.03;
  }

  if (lengthDelta <= 12) {
    score += 0.03;
  } else if (lengthDelta <= 25) {
    score += 0.01;
  }

  return score;
};

export const scoreSuggestions = (
  context: FieldContext,
  entries: MemoryEntry[],
): SuggestionEntry[] => {
  const query = buildQueryTokens([
    context.question_text,
    context.label,
    context.name,
    context.placeholder,
    context.section_heading,
    context.nearby_text,
  ]);

  const scored = entries.map((entry) => ({
    entry,
    score: scoreForEntry(query, entry),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.entry,
      score: item.score,
    }));
};
