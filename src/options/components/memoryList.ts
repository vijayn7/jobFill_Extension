import { MessageType } from '../../background/messages';
import type {
  MemoryEntry,
  MemoryManagerState,
  MessageRequestFor,
  MessageRequestMap,
  MessageResponseFor,
} from '../../shared/types';
import { renderImportExport } from './importExport';
import { renderMemoryEditor } from './memoryEditor';

const DEFAULT_PAGE_SIZE = 10;

const sendMessage = async <T extends keyof MessageRequestMap>(
  message: MessageRequestFor<T>,
): Promise<MessageResponseFor<T>> => {
  return chrome.runtime.sendMessage(message);
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildState = (): MemoryManagerState => ({
  entries: [],
  searchText: '',
  domainFilter: '',
  answerTypeFilter: '',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
});

const matchesSearch = (entry: MemoryEntry, query: string): boolean => {
  if (!query) {
    return true;
  }
  const normalized = query.toLowerCase();
  return (
    entry.question_text.toLowerCase().includes(normalized) ||
    entry.answer_text.toLowerCase().includes(normalized) ||
    entry.meta.domain.toLowerCase().includes(normalized)
  );
};

const getFilteredEntries = (state: MemoryManagerState): MemoryEntry[] => {
  return state.entries.filter((entry) => {
    if (state.domainFilter && entry.meta.domain !== state.domainFilter) {
      return false;
    }
    if (state.answerTypeFilter && entry.answer_type !== state.answerTypeFilter) {
      return false;
    }
    return matchesSearch(entry, state.searchText);
  });
};

const buildDomainOptions = (entries: MemoryEntry[]): string => {
  const domains = Array.from(new Set(entries.map((entry) => entry.meta.domain))).sort();
  return [
    '<option value="">All domains</option>',
    ...domains.map((domain) => `<option value="${escapeHtml(domain)}">${escapeHtml(domain)}</option>`),
  ].join('');
};

const buildAnswerTypeOptions = (entries: MemoryEntry[]): string => {
  const types = Array.from(new Set(entries.map((entry) => entry.answer_type))).sort();
  return [
    '<option value="">All answer types</option>',
    ...types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`),
  ].join('');
};

const buildEntryMarkup = (entry: MemoryEntry, isEditing: boolean): string => {
  const meta = `${entry.meta.domain} · ${entry.meta.section} · ${entry.answer_type}`;
  if (isEditing) {
    return `
      <li class="memory-entry" data-entry-id="${escapeHtml(entry.id)}">
        <div class="memory-entry__question">${escapeHtml(entry.question_text)}</div>
        <div class="memory-entry__editor"></div>
      </li>
    `;
  }

  return `
    <li class="memory-entry" data-entry-id="${escapeHtml(entry.id)}">
      <div class="memory-entry__question">${escapeHtml(entry.question_text)}</div>
      <div class="memory-entry__answer">${escapeHtml(entry.answer_text)}</div>
      <div class="memory-entry__meta">${escapeHtml(meta)}</div>
      <div class="memory-entry__actions">
        <button class="button button--ghost" data-action="edit">Edit</button>
        <button class="button button--danger" data-action="delete">Delete</button>
      </div>
    </li>
  `;
};

export const renderMemoryManager = async (root: HTMLElement): Promise<void> => {
  let state = buildState();
  let editingEntryId: string | null = null;
  let statusMessage = '';

  const loadEntries = async (): Promise<void> => {
    const response = await sendMessage({ type: MessageType.LIST_ENTRIES });
    state = { ...state, entries: response.payload.entries };
  };

  const updateState = (next: Partial<MemoryManagerState>): void => {
    state = { ...state, ...next };
  };

  const applyFiltersAndPagination = () => {
    const filtered = getFilteredEntries(state);
    const pageCount = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    const page = Math.min(state.page, pageCount);
    const start = (page - 1) * state.pageSize;
    const visible = filtered.slice(start, start + state.pageSize);
    return {
      entries: visible,
      total: filtered.length,
      pageCount,
      page,
    };
  };

  const render = (): void => {
    const { entries, total, pageCount, page } = applyFiltersAndPagination();
    if (page !== state.page) {
      updateState({ page });
    }
    const totalCount = state.entries.length;
    const emptyMessage = totalCount === 0 ? 'No saved answers yet.' : 'No matches found.';

    root.innerHTML = `
      <section class="memory-manager">
        <header class="memory-manager__header">
          <div>
            <h2>Saved answers</h2>
            <p>Manage the answers JobFill has stored for autofill.</p>
          </div>
          <div class="memory-manager__summary">${total} of ${totalCount} entries</div>
        </header>
        <div class="memory-manager__controls">
          <input
            type="search"
            placeholder="Search questions, answers, or domains"
            value="${escapeHtml(state.searchText)}"
            data-action="search"
          />
          <select data-action="domain-filter">${buildDomainOptions(state.entries)}</select>
          <select data-action="answer-filter">${buildAnswerTypeOptions(state.entries)}</select>
        </div>
        <ul class="memory-manager__list">
          ${entries.length ? entries.map((entry) => buildEntryMarkup(entry, entry.id === editingEntryId)).join('') : ''}
        </ul>
        ${entries.length ? '' : `<div class="memory-manager__empty">${escapeHtml(emptyMessage)}</div>`}
        <div class="memory-manager__pagination">
          <button class="button button--ghost" data-action="prev" ${page <= 1 ? 'disabled' : ''}>Previous</button>
          <span>Page ${page} of ${pageCount}</span>
          <button class="button button--ghost" data-action="next" ${page >= pageCount ? 'disabled' : ''}>Next</button>
        </div>
        <div class="memory-manager__import-export"></div>
        <div class="memory-manager__status">${escapeHtml(statusMessage)}</div>
      </section>
    `;

    const searchInput = root.querySelector<HTMLInputElement>('[data-action="search"]');
    const domainSelect = root.querySelector<HTMLSelectElement>('[data-action="domain-filter"]');
    const answerSelect = root.querySelector<HTMLSelectElement>('[data-action="answer-filter"]');
    const prevButton = root.querySelector<HTMLButtonElement>('[data-action="prev"]');
    const nextButton = root.querySelector<HTMLButtonElement>('[data-action="next"]');
    const importExport = root.querySelector<HTMLElement>('.memory-manager__import-export');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        updateState({ searchText: searchInput.value, page: 1 });
        render();
      });
    }

    if (domainSelect) {
      domainSelect.value = state.domainFilter;
      domainSelect.addEventListener('change', () => {
        updateState({ domainFilter: domainSelect.value, page: 1 });
        render();
      });
    }

    if (answerSelect) {
      answerSelect.value = state.answerTypeFilter;
      answerSelect.addEventListener('change', () => {
        updateState({ answerTypeFilter: answerSelect.value, page: 1 });
        render();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        updateState({ page: Math.max(1, state.page - 1) });
        render();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        updateState({ page: state.page + 1 });
        render();
      });
    }

    const entryNodes = root.querySelectorAll<HTMLElement>('.memory-entry');
    entryNodes.forEach((entryNode) => {
      const entryId = entryNode.dataset.entryId;
      if (!entryId) {
        return;
      }

      const entry = state.entries.find((item) => item.id === entryId);
      if (!entry) {
        return;
      }

      if (entryId === editingEntryId) {
        const editorContainer = entryNode.querySelector<HTMLElement>('.memory-entry__editor');
        if (editorContainer) {
          renderMemoryEditor(
            editorContainer,
            entry,
            async (value) => {
              if (!value) {
                statusMessage = 'Answer text cannot be empty.';
                render();
                return;
              }
              const response = await sendMessage({
                type: MessageType.UPDATE_ENTRY,
                payload: { entryId, value },
              });
              state = {
                ...state,
                entries: state.entries.map((item) =>
                  item.id === entryId ? response.payload.entry : item,
                ),
              };
              editingEntryId = null;
              statusMessage = 'Entry updated.';
              render();
            },
            () => {
              editingEntryId = null;
              render();
            },
          );
        }
        return;
      }

      const editButton = entryNode.querySelector<HTMLButtonElement>('[data-action="edit"]');
      const deleteButton = entryNode.querySelector<HTMLButtonElement>('[data-action="delete"]');

      if (editButton) {
        editButton.addEventListener('click', () => {
          editingEntryId = entryId;
          render();
        });
      }

      if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
          if (!confirm('Delete this saved answer?')) {
            return;
          }
          await sendMessage({
            type: MessageType.DELETE_ENTRY,
            payload: { entryId },
          });
          state = {
            ...state,
            entries: state.entries.filter((item) => item.id !== entryId),
          };
          statusMessage = 'Entry deleted.';
          render();
        });
      }
    });

    if (importExport) {
      renderImportExport(
        importExport,
        async () => {
          await loadEntries();
          updateState({ page: 1 });
          statusMessage = 'Entries refreshed.';
          render();
        },
        (message) => {
          statusMessage = message;
          render();
        },
      );
    }
  };

  await loadEntries();
  render();
};
