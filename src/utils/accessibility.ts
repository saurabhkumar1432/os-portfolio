/**
 * Accessibility utilities for the Portfolio OS
 */

export interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as FocusableElement[];
  
  return elements.filter(element => {
    // Check if element is visible and not hidden
    const style = getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  });
}

/**
 * Trap focus within a container (for modals, menus, etc.)
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

/**
 * Restore focus to a previously focused element
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get the contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert color to RGB values
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(c => {
      const channel = parseInt(c) / 255;
      return channel <= 0.03928 
        ? channel / 12.92 
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Generate a unique ID for accessibility purposes
 */
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a live region for announcements
 */
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = generateA11yId('live-region');
  
  document.body.appendChild(liveRegion);
  return liveRegion;
}

/**
 * Update live region content
 */
export function updateLiveRegion(liveRegion: HTMLElement, message: string): void {
  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

/**
 * Handle keyboard navigation for grid layouts
 */
export function handleGridNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  columns: number,
  onNavigate: (newIndex: number) => void
): void {
  const rows = Math.ceil(totalItems / columns);
  const currentRow = Math.floor(currentIndex / columns);

  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowRight':
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : currentIndex;
      break;
    case 'ArrowLeft':
      newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      break;
    case 'ArrowDown':
      if (currentRow < rows - 1) {
        newIndex = Math.min(currentIndex + columns, totalItems - 1);
      }
      break;
    case 'ArrowUp':
      if (currentRow > 0) {
        newIndex = currentIndex - columns;
      }
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = totalItems - 1;
      break;
    default:
      return;
  }

  if (newIndex !== currentIndex) {
    event.preventDefault();
    onNavigate(newIndex);
  }
}

/**
 * Skip link functionality
 */
export function createSkipLink(targetId: string, text: string): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  
  // Style the skip link
  Object.assign(skipLink.style, {
    position: 'absolute',
    top: '-40px',
    left: '6px',
    background: '#000',
    color: '#fff',
    padding: '8px',
    textDecoration: 'none',
    zIndex: '100000',
    borderRadius: '4px'
  });

  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
}

/**
 * Manage focus for roving tabindex pattern
 */
export class RovingTabindexManager {
  private elements: HTMLElement[] = [];
  private currentIndex = 0;

  constructor(container: HTMLElement, selector: string) {
    this.elements = Array.from(container.querySelectorAll(selector));
    this.init();
  }

  private init(): void {
    this.elements.forEach((element, index) => {
      element.tabIndex = index === 0 ? 0 : -1;
      element.addEventListener('keydown', this.handleKeydown.bind(this));
      element.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const currentIndex = this.elements.indexOf(target);

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % this.elements.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = currentIndex === 0 ? this.elements.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = this.elements.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      this.focusElement(newIndex);
    }
  }

  private setCurrentIndex(index: number): void {
    this.elements.forEach((element, i) => {
      element.tabIndex = i === index ? 0 : -1;
    });
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  private focusElement(index: number): void {
    this.setCurrentIndex(index);
    this.elements[index].focus();
  }

  public updateElements(container: HTMLElement, selector: string): void {
    // Remove old event listeners
    this.elements.forEach(element => {
      element.removeEventListener('keydown', this.handleKeydown.bind(this));
    });

    // Update elements and reinitialize
    this.elements = Array.from(container.querySelectorAll(selector));
    this.currentIndex = 0;
    this.init();
  }
}