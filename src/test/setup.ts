import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
});

// Mock navigator.standalone for PWA tests
Object.defineProperty(navigator, 'standalone', {
  value: false,
  writable: true,
  configurable: true,
});

// Mock service worker registration
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({
      installing: null,
      waiting: null,
      active: null,
      scope: '/',
      update: vi.fn(),
      unregister: vi.fn().mockResolvedValue(true),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    getRegistration: vi.fn().mockResolvedValue(null),
    getRegistrations: vi.fn().mockResolvedValue([]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock Blob constructor
global.Blob = vi.fn().mockImplementation((content, options) => ({
  size: content ? content.length : 0,
  type: options?.type || '',
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn().mockResolvedValue(content?.[0] || ''),
  arrayBuffer: vi.fn(),
}));

// Setup DOM container for tests
beforeEach(() => {
  // Ensure we have a root element for react-dom
  if (!document.getElementById('root')) {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
  }
});

afterEach(() => {
  // Safe DOM cleanup to prevent test contamination and memory leaks
  
  // First, run React cleanup
  cleanup();
  
  // Restore any mocked globals/DOM methods before cleanup
  vi.restoreAllMocks();
  
  // Clear only content within body, but preserve structure
  const elementsToRemove = document.body.querySelectorAll(':not(#root)');
  elementsToRemove.forEach(el => el.remove());
  
  // Clear root content but keep the element
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
  }
  
  // Clear any floating elements that might persist
  const head = document.head;
  const dynamicElements = head.querySelectorAll('[data-dynamic]');
  dynamicElements.forEach(el => el.remove());
  
  // Reset any global state that might leak between tests
  if (window.history?.replaceState) {
    window.history.replaceState({}, '', '/');
  }
});
