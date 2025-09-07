import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceUtils } from '../index';

describe('performanceUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn();
      const debouncedFn = performanceUtils.debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when called multiple times', () => {
      const fn = vi.fn();
      const debouncedFn = performanceUtils.debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const fn = vi.fn();
      const debouncedFn = performanceUtils.debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);
      
      debouncedFn(); // This should reset the timer
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const fn = vi.fn();
      const debouncedFn = performanceUtils.debounce(fn, 100);

      debouncedFn('arg1', 'arg2', 123);
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should use the latest arguments when called multiple times', () => {
      const fn = vi.fn();
      const debouncedFn = performanceUtils.debounce(fn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('third');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should execute function immediately on first call', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should ignore subsequent calls within the limit', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should allow execution after the limit period', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to the throttled function', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      throttledFn('arg1', 'arg2', 123);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should use the first arguments when called multiple times within limit', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      expect(fn).toHaveBeenCalledWith('first');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset throttle after the limit period', () => {
      const fn = vi.fn();
      const throttledFn = performanceUtils.throttle(fn, 100);

      // First call
      throttledFn('first');
      expect(fn).toHaveBeenCalledWith('first');

      // Calls within limit (should be ignored)
      throttledFn('ignored1');
      throttledFn('ignored2');
      expect(fn).toHaveBeenCalledTimes(1);

      // Wait for limit to pass
      vi.advanceTimersByTime(100);

      // Next call should work
      throttledFn('second');
      expect(fn).toHaveBeenCalledWith('second');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});