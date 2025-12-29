export const createWidget = (): HTMLDivElement => {
  const root = document.createElement('div');
  root.className = 'jobfill-widget jobfill-widget--hidden';
  root.setAttribute('data-jobfill-widget', 'true');

  root.innerHTML = `
    <div class="jobfill-widget__header">
      <span class="jobfill-widget__title">JobFill Assistant</span>
      <div class="jobfill-widget__header-actions">
        <button type="button" class="jobfill-widget__action" data-jobfill-action="pin">
          Pin
        </button>
        <button type="button" class="jobfill-widget__action" data-jobfill-action="hide">
          Hide
        </button>
      </div>
    </div>
    <div class="jobfill-widget__section">
      <div class="jobfill-widget__label">Detected question</div>
      <div class="jobfill-widget__question" data-jobfill-question></div>
    </div>
    <div class="jobfill-widget__section">
      <div class="jobfill-widget__label">Metadata</div>
      <div class="jobfill-widget__pills" data-jobfill-meta></div>
    </div>
    <div class="jobfill-widget__section">
      <div class="jobfill-widget__label">Suggestions</div>
      <div class="jobfill-widget__placeholder" data-jobfill-suggestions>
        Suggestions will appear here.
      </div>
    </div>
    <div class="jobfill-widget__section jobfill-widget__section--warning" data-jobfill-warning hidden>
      <div class="jobfill-widget__warning">
        Sensitive field detected.
      </div>
    </div>
    <div class="jobfill-widget__section">
      <label class="jobfill-widget__label" for="jobfill-draft">Draft answer</label>
      <textarea
        id="jobfill-draft"
        class="jobfill-widget__textarea"
        rows="4"
        placeholder="Type your response..."
        data-jobfill-draft
      ></textarea>
    </div>
    <div class="jobfill-widget__actions">
      <button type="button" class="jobfill-widget__button jobfill-widget__button--primary" data-jobfill-action="fill">
        Fill
      </button>
      <button type="button" class="jobfill-widget__button" data-jobfill-action="save">
        Save
      </button>
      <button type="button" class="jobfill-widget__button" data-jobfill-action="clear">
        Clear
      </button>
    </div>
    <div class="jobfill-widget__section jobfill-widget__section--autofill">
      <div class="jobfill-widget__label">Autofill</div>
      <div class="jobfill-widget__autofill-status" data-jobfill-autofill-status hidden></div>
      <div class="jobfill-widget__autofill-skipped" data-jobfill-autofill-skipped hidden></div>
      <div class="jobfill-widget__actions jobfill-widget__actions--autofill">
        <button type="button" class="jobfill-widget__button jobfill-widget__button--primary" data-jobfill-action="autofill">
          Autofill page
        </button>
        <button type="button" class="jobfill-widget__button" data-jobfill-action="autofill-stop" hidden>
          Stop
        </button>
      </div>
    </div>
  `;

  return root;
};
