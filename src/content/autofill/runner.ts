import { MessageType } from '../../background/messages';
import type {
  ContentSettings,
  FieldContext,
  FieldElement,
  GetSuggestionsRequest,
  GetSuggestionsResponse,
  MarkUsedRequest,
  MarkUsedResponse,
  SuggestionEntry,
} from '../../shared/types';
import { detectSensitiveField } from '../../shared/sensitive';
import { buildFieldContext } from '../extract/context';
import { setContentEditableValue } from '../fill/contenteditable';
import { setSelectValue } from '../fill/select';
import { setInputValue } from '../fill/setValue';
import { getFillableFields, isFillableElement } from '../navigation/nextField';
import type { ExtensionSettings } from '../../shared/types';

const RUN_DELAY_MS = 120;

export interface AutofillProgress {
  total: number;
  completed: number;
  skipped: number;
}

export interface AutofillRunState extends AutofillProgress {
  running: boolean;
}

export interface AutofillRunnerCallbacks {
  onProgress?: (state: AutofillRunState) => void;
}

export interface AutofillRunner {
  start: () => Promise<void>;
  cancel: () => void;
  isRunning: () => boolean;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const getFieldValue = (field: FieldElement): string => {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value ?? '';
  }
  if (field instanceof HTMLSelectElement) {
    return field.value ?? '';
  }
  if (field.isContentEditable) {
    return field.textContent ?? '';
  }
  return '';
};

const fillField = (field: FieldElement, value: string): void => {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    setInputValue(field, value);
  } else if (field instanceof HTMLSelectElement) {
    setSelectValue(field, value);
  } else if (field.isContentEditable) {
    setContentEditableValue(field, value);
  }
};

const requestSuggestions = (context: FieldContext): Promise<SuggestionEntry[]> => {
  const request: GetSuggestionsRequest = {
    type: MessageType.GET_SUGGESTIONS,
    payload: {
      field: context,
      limit: 5,
    },
  };

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(request, (response: GetSuggestionsResponse) => {
      if (!response || response.type !== MessageType.GET_SUGGESTIONS) {
        resolve([]);
        return;
      }
      resolve(response.payload.suggestions);
    });
  });
};

const markUsed = (entryId: string): void => {
  const request: MarkUsedRequest = {
    type: MessageType.MARK_USED,
    payload: {
      entryId,
    },
  };

  chrome.runtime.sendMessage(request, (response: MarkUsedResponse) => {
    if (!response || response.type !== MessageType.MARK_USED) {
      return;
    }
  });
};

const isProfileSuggestion = (suggestion: SuggestionEntry): boolean => {
  return suggestion.id.startsWith('profile-') || suggestion.meta.platform === 'profile';
};

const pickSuggestion = (
  suggestions: SuggestionEntry[],
  threshold: number,
): SuggestionEntry | null => {
  if (suggestions.length === 0) {
    return null;
  }

  const profile = suggestions.find(isProfileSuggestion);
  if (profile) {
    return { ...profile, score: 1 };
  }

  const top = suggestions[0];
  if (top.score >= threshold) {
    return top;
  }
  return null;
};

export const createAutofillRunner = (
  settings: ExtensionSettings,
  contentSettings: ContentSettings,
  callbacks: AutofillRunnerCallbacks = {},
): AutofillRunner => {
  let running = false;
  let cancelled = false;
  let completed = 0;
  let skipped = 0;
  const contextCache = new WeakMap<FieldElement, FieldContext>();
  const suggestionCache = new WeakMap<FieldElement, SuggestionEntry[]>();

  const notify = (total: number) => {
    callbacks.onProgress?.({
      total,
      completed,
      skipped,
      running,
    });
  };

  const shouldSkip = (field: FieldElement): boolean => {
    if (!isFillableElement(field)) {
      return true;
    }
    if (!contentSettings.autofillOverwriteExisting) {
      const value = getFieldValue(field).trim();
      if (value) {
        return true;
      }
    }
    return false;
  };

  const getContext = (field: FieldElement): FieldContext => {
    const cached = contextCache.get(field);
    if (cached) {
      return cached;
    }
    const context = buildFieldContext(field);
    contextCache.set(field, context);
    return context;
  };

  const getSuggestions = async (field: FieldElement): Promise<SuggestionEntry[]> => {
    const cached = suggestionCache.get(field);
    if (cached) {
      return cached;
    }
    const context = getContext(field);
    const suggestions = await requestSuggestions(context);
    suggestionCache.set(field, suggestions);
    return suggestions;
  };

  const start = async (): Promise<void> => {
    running = true;
    cancelled = false;
    completed = 0;
    skipped = 0;

    const fields = getFillableFields();
    notify(fields.length);

    for (const field of fields) {
      if (cancelled) {
        break;
      }

      if (shouldSkip(field)) {
        skipped += 1;
        completed += 1;
        notify(fields.length);
        await delay(RUN_DELAY_MS);
        continue;
      }

      const context = getContext(field);
      const sensitiveDetection = detectSensitiveField(context);
      if (sensitiveDetection.isSensitive && settings.sensitiveHandling === 'block') {
        skipped += 1;
        completed += 1;
        notify(fields.length);
        await delay(RUN_DELAY_MS);
        continue;
      }

      const suggestions = await getSuggestions(field);
      const choice = pickSuggestion(
        suggestions,
        contentSettings.autofillConfidenceThreshold,
      );
      if (!choice) {
        skipped += 1;
        completed += 1;
        notify(fields.length);
        await delay(RUN_DELAY_MS);
        continue;
      }

      fillField(field, choice.answer_text);
      markUsed(choice.id);
      completed += 1;
      notify(fields.length);
      await delay(RUN_DELAY_MS);
    }

    running = false;
    notify(getFillableFields().length);
  };

  return {
    start,
    cancel: () => {
      cancelled = true;
      running = false;
    },
    isRunning: () => running,
  };
};
