const debugField = document.getElementById('debug-field');
const debugQuestion = document.getElementById('debug-question');
const debugSection = document.getElementById('debug-section');

const cleanText = (value) => {
  if (!value) {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim();
};

const textFromIds = (ids) => {
  return ids
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((el) => cleanText(el.textContent))
    .filter(Boolean)
    .join(' ');
};

const getLabelText = (el) => {
  if (!el) {
    return '';
  }

  if (el.id) {
    const explicit = document.querySelector(`label[for="${el.id}"]`);
    if (explicit) {
      return cleanText(explicit.textContent);
    }
  }

  const wrapped = el.closest('label');
  if (wrapped) {
    return cleanText(wrapped.textContent);
  }

  if (el.getAttribute('aria-label')) {
    return cleanText(el.getAttribute('aria-label'));
  }

  if (el.getAttribute('aria-labelledby')) {
    return textFromIds(el.getAttribute('aria-labelledby'));
  }

  if (el.placeholder) {
    return cleanText(el.placeholder);
  }

  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) {
      return cleanText(legend.textContent);
    }
  }

  return '';
};

const getSectionHeading = (el) => {
  if (!el) {
    return '';
  }

  const section = el.closest('section, fieldset');
  if (section) {
    const heading = section.querySelector('h1, h2, h3, h4, legend');
    if (heading) {
      return cleanText(heading.textContent);
    }
  }

  let current = el.parentElement;
  while (current) {
    const previousHeading = current.previousElementSibling?.querySelector?.(
      'h1, h2, h3, h4'
    );
    if (previousHeading) {
      return cleanText(previousHeading.textContent);
    }
    current = current.parentElement;
  }

  return '';
};

const updateDebugPanel = (el) => {
  debugField.textContent = el?.id || el?.getAttribute('name') || 'Unknown';
  debugQuestion.textContent = getLabelText(el) || 'Unknown';
  debugSection.textContent = getSectionHeading(el) || 'Unknown';
};

const onFocus = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const isEditable =
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable;

  if (!isEditable) {
    return;
  }

  updateDebugPanel(target);
};

document.addEventListener('focusin', onFocus);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const container = document.getElementById('dynamic-container');
    if (!container) {
      return;
    }

    container.innerHTML = `
      <label for="dynamic-field">Dynamic referral code</label>
      <input id="dynamic-field" type="text" name="referralCode" placeholder="Enter code" />
    `;
  }, 2000);
});
