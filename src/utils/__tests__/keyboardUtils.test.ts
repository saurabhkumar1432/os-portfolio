import { describe, it, expect, vi } from 'vitest';
import { keyboardUtils } from '../index';

describe('keyboardUtils', () => {
  describe('matchesShortcut', () => {
    it('should match simple key shortcut', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const shortcut = { key: 'escape' };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match ctrl+key shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'w', 
        ctrlKey: true 
      });
      const shortcut = { key: 'w', ctrl: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match alt+key shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        altKey: true 
      });
      const shortcut = { key: 'tab', alt: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match shift+key shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'F10', 
        shiftKey: true 
      });
      const shortcut = { key: 'f10', shift: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match meta+key shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'ArrowLeft', 
        metaKey: true 
      });
      const shortcut = { key: 'arrowleft', meta: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match complex modifier combination', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true,
        shiftKey: true
      });
      const shortcut = { key: 's', ctrl: true, shift: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should not match when key is different', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const shortcut = { key: 'b' };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match when modifiers are different', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'w', 
        ctrlKey: true 
      });
      const shortcut = { key: 'w', alt: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match when extra modifiers are present', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'w', 
        ctrlKey: true,
        shiftKey: true
      });
      const shortcut = { key: 'w', ctrl: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match when required modifiers are missing', () => {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      const shortcut = { key: 'w', ctrl: true };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should be case insensitive for keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' });
      const shortcut = { key: 'a' };

      expect(keyboardUtils.matchesShortcut(event, shortcut)).toBe(true);
    });
  });

  describe('handleShortcut', () => {
    it('should prevent default and stop propagation', () => {
      const event = new KeyboardEvent('keydown', { key: 'w', ctrlKey: true });
      const handler = vi.fn();
      
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      keyboardUtils.handleShortcut(event, handler);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it('should call the handler function', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const handler = vi.fn();

      keyboardUtils.handleShortcut(event, handler);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});