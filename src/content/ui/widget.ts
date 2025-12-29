import { MessageType } from '../../background/messages';
import type {
  FieldContext,
  FieldElement,
  GetSuggestionsRequest,
  GetSuggestionsResponse,
  MemoryEntry,
  SaveAnswerRequest,
  SaveAnswerResponse,
  SensitiveFieldDetection,
  SensitiveHandling,
} from '../../shared/types';
import { detectSensitiveField } from '../../shared/sensitive';
import { DEFAULT_SETTINGS } from '../../shared/settings';
import { buildFieldContext } from '../extract/context';
import { normalizeFieldElement } from '../extract/fieldTypes';
import { setContentEditableValue } from '../fill/contenteditable';
import { setSelectValue } from '../fill/select';
import { setInputValue } from '../fill/setValue';
import { getSettings } from '../state';
import { createWidget } from './render';

const STYLE_MARKER = 'data-jobfill-style';
const QUESTION_SELECTOR = '[data-jobfill-question]';
const META_SELECTOR = '[data-jobfill-meta]';
const SUGGESTIONS_SELECTOR = '[data-jobfill-suggestions]';
const DRAFT_SELECTOR = '[data-jobfill-draft]';
const WARNING_SELECTOR = '[data-jobfill-warning]';

let widgetRoot: HTMLDivElement | null = null;
let activeField: FieldElement | null = null;
let activeContext: FieldContext | null = null;
let activeSensitive: SensitiveFieldDetection | null = null;
let activeSensitiveHandling: SensitiveHandling = DEFAULT_SETTINGS.sensitiveHandling;
let suggestionRequestToken = 0;
let focusToken = 0;

const ensureStyles = (): void => {
  if (document.querySelector(`link[${STYLE_MARKER}]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content/ui/styles.css');
  link.setAttribute(STYLE_MARKER, 'true');
  document.head.appendChild(link);
};

const getMetadataPills = (context: FieldContext): string[] => {
  const pills: string[] = [];

  if (context.section_heading) {
    pills.push(context.section_heading);
  }

  if (context.input_type) {
    pills.push(context.input_type);
  }

  if (context.required) {
    pills.push('Required');
  }

  if (context.maxlength) {
    pills.push(`Max ${context.maxlength}`);
  }

  if (context.domain) {
    pills.push(context.domain);
  }

  return pills;
};

const updateWidgetContent = (context: FieldContext, resetDraft: boolean): void => {
  if (!widgetRoot) {
    return;
  }

  const question = widgetRoot.querySelector<HTMLElement>(QUESTION_SELECTOR);
  if (question) {
    question.textContent =
      context.question_text || context.label || 'We detected a question for this field.';
  }

  const meta = widgetRoot.querySelector<HTMLElement>(META_SELECTOR);
  if (meta) {
    meta.innerHTML = '';
    const pills = getMetadataPills(context);
    if (pills.length === 0) {
      const placeholder = document.createElement('span');
      placeholder.className = 'jobfill-widget__pill jobfill-widget__pill--muted';
      placeholder.textContent = 'No metadata';
      meta.appendChild(placeholder);
    } else {
      pills.forEach((pill) => {
        const span = document.createElement('span');
        span.className = 'jobfill-widget__pill';
        span.textContent = pill;
        meta.appendChild(span);
      });
    }
  }

  const suggestions = widgetRoot.querySelector<HTMLElement>(SUGGESTIONS_SELECTOR);
  if (suggestions) {
    suggestions.textContent = 'Fetching suggestions...';
  }

  if (resetDraft) {
    const draft = widgetRoot.querySelector<HTMLTextAreaElement>(DRAFT_SELECTOR);
    if (draft) {
      draft.value = context.value ?? '';
    }
  }
};

const formatSensitiveMatches = (matches: SensitiveFieldDetection['matches']): string => {
  const labelMap: Record<SensitiveFieldDetection['matches'][number], string> = {
    ssn: 'SSN',
    dob: 'DOB',
    passport: 'passport',
    bank: 'bank account',
    tax_id: 'tax ID',
  };

  return matches.map((match) => labelMap[match]).join(', ');
};

const updateWarning = (message: string | null): void => {
  if (!widgetRoot) {
    return;
  }

  const warning = widgetRoot.querySelector<HTMLElement>(WARNING_SELECTOR);
  if (!warning) {
    return;
  }

  if (!message) {
    warning.setAttribute('hidden', 'true');
    warning.textContent = '';
    return;
  }

  warning.removeAttribute('hidden');
  warning.textContent = message;
};

const updateSuggestionsPlaceholder = (message: string): void => {
  if (!widgetRoot) {
    return;
  }

  const suggestions = widgetRoot.querySelector<HTMLElement>(SUGGESTIONS_SELECTOR);
  if (suggestions) {
    suggestions.textContent = message;
  }
};

const applySensitiveState = (
  detection: SensitiveFieldDetection,
  handling: SensitiveHandling,
): void => {
  if (!widgetRoot) {
    return;
  }

  const fillButton = widgetRoot.querySelector<HTMLButtonElement>(
    '[data-jobfill-action="fill"]',
  );

  if (!detection.isSensitive) {
    activeSensitive = detection;
    activeSensitiveHandling = handling;
    updateWarning(null);
    if (fillButton) {
      fillButton.disabled = false;
    }
    return;
  }

  const matchList = formatSensitiveMatches(detection.matches);
  const warningText =
    handling === 'block'
      ? `Sensitive field detected (${matchList}). Autofill is blocked.`
      : `Sensitive field detected (${matchList}). Autofill is allowed, but suggestions are hidden.`;

  activeSensitive = detection;
  activeSensitiveHandling = handling;
  updateWarning(warningText);
  updateSuggestionsPlaceholder('Suggestions are hidden for sensitive fields.');
  if (fillButton) {
    fillButton.disabled = handling === 'block';
  }
};

const renderSuggestions = (suggestions: MemoryEntry[]): void => {
  if (!widgetRoot) {
    return;
  }

  const container = widgetRoot.querySelector<HTMLElement>(SUGGESTIONS_SELECTOR);
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (suggestions.length === 0) {
    container.textContent = 'No matching suggestions yet.';
    return;
  }

  const list = document.createElement('div');
  list.className = 'jobfill-widget__suggestion-list';

  suggestions.forEach((suggestion) => {
    const item = document.createElement('div');
    item.className = 'jobfill-widget__suggestion';

    const question = document.createElement('div');
    question.className = 'jobfill-widget__suggestion-question';
    question.textContent = suggestion.question_text || 'Saved answer';

    const answer = document.createElement('div');
    answer.className = 'jobfill-widget__suggestion-answer';
    answer.textContent = suggestion.answer_text;

    item.appendChild(question);
    item.appendChild(answer);
    list.appendChild(item);
  });

  container.appendChild(list);
};

const isFillBlocked = (): boolean => {
  return Boolean(activeSensitive?.isSensitive && activeSensitiveHandling === 'block');
};

const requestSuggestions = (context: FieldContext): void => {
  const request: GetSuggestionsRequest = {
    type: MessageType.GET_SUGGESTIONS,
    payload: {
      field: context,
      limit: 5,
    },
  };

  const requestToken = (suggestionRequestToken += 1);

  chrome.runtime.sendMessage(request, (response: GetSuggestionsResponse) => {
    if (!response || response.type !== MessageType.GET_SUGGESTIONS) {
      return;
    }
    if (requestToken !== suggestionRequestToken) {
      return;
    }
    if (activeSensitive?.isSensitive) {
      return;
    }
    renderSuggestions(response.payload.suggestions);
  });
};

const positionWidget = (field: FieldElement): void => {
  if (!widgetRoot) {
    return;
  }

  const rect = field.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const desiredTop = rect.bottom + scrollY + 8;
  const desiredLeft = rect.left + scrollX;

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  const widgetWidth = widgetRoot.offsetWidth || 360;
  const widgetHeight = widgetRoot.offsetHeight || 240;

  const minLeft = scrollX + 8;
  const maxLeft = scrollX + viewportWidth - widgetWidth - 8;
  const minTop = scrollY + 8;
  const maxTop = scrollY + viewportHeight - widgetHeight - 8;

  const left = Math.min(Math.max(desiredLeft, minLeft), Math.max(minLeft, maxLeft));
  const top = Math.min(Math.max(desiredTop, minTop), Math.max(minTop, maxTop));

  widgetRoot.style.left = `${left}px`;
  widgetRoot.style.top = `${top}px`;
};

const showWidget = (): void => {
  widgetRoot?.classList.remove('jobfill-widget--hidden');
};

const hideWidget = (): void => {
  widgetRoot?.classList.add('jobfill-widget--hidden');
};

const fillActiveField = (): void => {
  if (!activeField || !widgetRoot) {
    return;
  }

  if (isFillBlocked()) {
    return;
  }

  const draft = widgetRoot.querySelector<HTMLTextAreaElement>(DRAFT_SELECTOR);
  if (!draft) {
    return;
  }

  const value = draft.value;
  if (activeField instanceof HTMLInputElement || activeField instanceof HTMLTextAreaElement) {
    setInputValue(activeField, value);
  } else if (activeField instanceof HTMLSelectElement) {
    setSelectValue(activeField, value);
  } else if (activeField.isContentEditable) {
    setContentEditableValue(activeField, value);
  }
};

const saveDraft = (): void => {
  if (!activeContext || !widgetRoot) {
    return;
  }

  const draft = widgetRoot.querySelector<HTMLTextAreaElement>(DRAFT_SELECTOR);
  if (!draft) {
    return;
  }

  const request: SaveAnswerRequest = {
    type: MessageType.SAVE_ANSWER,
    payload: {
      field: activeContext,
      value: draft.value,
    },
  };

  chrome.runtime.sendMessage(request, (response: SaveAnswerResponse) => {
    if (!response || response.type !== MessageType.SAVE_ANSWER) {
      return;
    }
    if (activeContext) {
      requestSuggestions(activeContext);
    }
  });
};

const clearDraft = (): void => {
  if (!widgetRoot) {
    return;
  }

  const draft = widgetRoot.querySelector<HTMLTextAreaElement>(DRAFT_SELECTOR);
  if (draft) {
    draft.value = '';
  }
};

const handleFocusIn = (event: FocusEvent): void => {
  void handleFocusInAsync(event);
};

const handleFocusInAsync = async (event: FocusEvent): Promise<void> => {
  const target = event.target;
  if (widgetRoot && target instanceof Node && widgetRoot.contains(target)) {
    return;
  }

  const field = normalizeFieldElement(target);
  if (!field) {
    return;
  }

  const context = buildFieldContext(field);
  const isNewField = field !== activeField;
  const focusId = (focusToken += 1);
  const settings = await getSettings();

  if (focusId !== focusToken) {
    return;
  }

  const detection = detectSensitiveField(context);

  activeField = field;
  activeContext = context;

  updateWidgetContent(context, isNewField);
  applySensitiveState(detection, settings.sensitiveHandling);

  if (isNewField && !detection.isSensitive) {
    requestSuggestions(context);
  }
  showWidget();
  positionWidget(field);
};

const handleScroll = (): void => {
  if (!activeField || !widgetRoot || widgetRoot.classList.contains('jobfill-widget--hidden')) {
    return;
  }

  positionWidget(activeField);
};

const ensureWidget = (): HTMLDivElement => {
  if (widgetRoot) {
    return widgetRoot;
  }

  widgetRoot = createWidget();
  document.body.appendChild(widgetRoot);

  const fillButton = widgetRoot.querySelector<HTMLButtonElement>('[data-jobfill-action="fill"]');
  const saveButton = widgetRoot.querySelector<HTMLButtonElement>('[data-jobfill-action="save"]');
  const clearButton = widgetRoot.querySelector<HTMLButtonElement>('[data-jobfill-action="clear"]');
  const hideButton = widgetRoot.querySelector<HTMLButtonElement>('[data-jobfill-action="hide"]');

  fillButton?.addEventListener('click', fillActiveField);
  saveButton?.addEventListener('click', saveDraft);
  clearButton?.addEventListener('click', clearDraft);
  hideButton?.addEventListener('click', hideWidget);

  return widgetRoot;
};

export const initWidget = (): void => {
  ensureStyles();
  ensureWidget();

  document.addEventListener('focusin', handleFocusIn, true);
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', handleScroll);

  const initializeActiveField = async (): Promise<void> => {
    const initialTarget = document.activeElement;
    if (initialTarget && initialTarget !== document.body) {
      const field = normalizeFieldElement(initialTarget);
      if (field) {
        const context = buildFieldContext(field);
        const settings = await getSettings();
        activeField = field;
        activeContext = context;
        activeSensitiveHandling = settings.sensitiveHandling;
        const detection = detectSensitiveField(context);
        updateWidgetContent(context, true);
        applySensitiveState(detection, settings.sensitiveHandling);
        if (!detection.isSensitive) {
          requestSuggestions(context);
        }
        showWidget();
        positionWidget(field);
      }
    }
  };

  void initializeActiveField();
};
