import type { FieldElement } from '../../shared/types';

export type WidgetPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface AnchoredPosition {
  top: number;
  left: number;
  placement: WidgetPlacement;
}

const VIEWPORT_PADDING = 8;
const FIELD_OFFSET = 10;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const calculateAnchoredPosition = (
  field: FieldElement,
  widget: HTMLElement,
  options: {
    avoidBelow?: boolean;
  } = {},
): AnchoredPosition => {
  const rect = field.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const widgetWidth = widget.offsetWidth || 360;
  const widgetHeight = widget.offsetHeight || 240;

  const spaceRight = viewportWidth - rect.right;
  const spaceLeft = rect.left;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  const fitsRight = spaceRight >= widgetWidth + FIELD_OFFSET;
  const fitsLeft = spaceLeft >= widgetWidth + FIELD_OFFSET;

  let placement: WidgetPlacement;

  if (fitsRight) {
    placement = 'right';
  } else if (fitsLeft) {
    placement = 'left';
  } else {
    if (options.avoidBelow) {
      placement = 'top';
    } else {
      placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }
  }

  let top = rect.top;
  let left = rect.left;

  switch (placement) {
    case 'right':
      left = rect.right + FIELD_OFFSET;
      top = rect.top;
      break;
    case 'left':
      left = rect.left - widgetWidth - FIELD_OFFSET;
      top = rect.top;
      break;
    case 'bottom':
      left = rect.left;
      top = rect.bottom + FIELD_OFFSET;
      break;
    case 'top':
      left = rect.left;
      top = rect.top - widgetHeight - FIELD_OFFSET;
      break;
    default:
      break;
  }

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const minLeft = scrollX + VIEWPORT_PADDING;
  const maxLeft = scrollX + viewportWidth - widgetWidth - VIEWPORT_PADDING;
  const minTop = scrollY + VIEWPORT_PADDING;
  const maxTop = scrollY + viewportHeight - widgetHeight - VIEWPORT_PADDING;

  return {
    placement,
    left: clamp(left + scrollX, minLeft, Math.max(minLeft, maxLeft)),
    top: clamp(top + scrollY, minTop, Math.max(minTop, maxTop)),
  };
};
