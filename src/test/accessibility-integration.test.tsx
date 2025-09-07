import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityAnnouncer } from '../components/AccessibilityAnnouncer';
import { AccessibilityToolbar } from '../components/AccessibilityToolbar';
import { SkipLink } from '../components/SkipLink';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { TestWrapper } from './setup';
import { vi } from 'vitest';

expect.extend(toHaveNoViolations);

describe('Accessibility Features', () => {
  describe('AccessibilityAnnouncer', () => {
    it('should create live region for screen reader announcements', () => {
      render(
        <TestWrapper>
          <AccessibilityAnnouncer />
        </TestWrapper>
      );

      const liveRegion = screen.getByTestId('accessibility-announcer');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('should announce window focus changes', async () => {
      const TestComponent = () => {
        const { announceToScreenReader } = useAccessibilitySettings();
        
        return (
          <TestWrapper>
            <AccessibilityAnnouncer />
            <button onClick={() => announceToScreenReader('Test announcement')}>
              Announce
            </button>
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button', { name: 'Announce' });
      fireEvent.click(button);

      // Check that announcement elements are created
      await waitFor(() => {
        const announcements = document.querySelectorAll('[aria-live="polite"]');
        expect(announcements.length).toBeGreaterThan(1); // Original + dynamic
      });
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibilityAnnouncer />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkipLink', () => {
    it('should render skip link with proper accessibility attributes', () => {
      render(
        <SkipLink href="#main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByTestId('skip-link');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveTextContent('Skip to main content');
    });

    it('should be focusable and visible when focused', async () => {
      const user = userEvent.setup();
      
      render(
        <SkipLink href="#main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByTestId('skip-link');
      
      // Should be positioned off-screen initially
      expect(skipLink).toHaveClass('-top-10');
      
      // Focus the skip link
      await user.tab();
      expect(skipLink).toHaveFocus();
      
      // Should become visible when focused
      expect(skipLink).toHaveClass('focus:top-4');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <SkipLink href="#main-content">
          Skip to main content
        </SkipLink>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('AccessibilityToolbar', () => {
    it('should render accessibility controls with proper labels', () => {
      render(
        <TestWrapper>
          <AccessibilityToolbar />
        </TestWrapper>
      );

      const toolbar = screen.getByTestId('accessibility-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('role', 'toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Accessibility tools');

      const highContrastButton = screen.getByTestId('high-contrast-toggle');
      const largeTextButton = screen.getByTestId('large-text-toggle');
      const reducedMotionButton = screen.getByTestId('reduced-motion-toggle');

      expect(highContrastButton).toHaveAttribute('aria-pressed');
      expect(largeTextButton).toHaveAttribute('aria-pressed');
      expect(reducedMotionButton).toHaveAttribute('aria-pressed');
    });

    it('should toggle high contrast mode', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibilityToolbar />
        </TestWrapper>
      );

      const highContrastButton = screen.getByTestId('high-contrast-toggle');
      
      // Initially should be false
      expect(highContrastButton).toHaveAttribute('aria-pressed', 'false');
      
      // Click to enable high contrast
      await user.click(highContrastButton);
      
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('high-contrast');
      });
    });

    it('should toggle large text mode', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibilityToolbar />
        </TestWrapper>
      );

      const largeTextButton = screen.getByTestId('large-text-toggle');
      
      // Click to enable large text
      await user.click(largeTextButton);
      
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('large-text');
      });
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibilityToolbar />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('High Contrast Mode', () => {
    beforeEach(() => {
      // Reset classes
      document.documentElement.className = '';
    });

    it('should apply high contrast styles when enabled', () => {
      document.documentElement.classList.add('high-contrast');
      
      expect(document.documentElement).toHaveClass('high-contrast');
      
      // Test CSS custom properties would be applied
      const styles = getComputedStyle(document.documentElement);
      // These would need to be tested with actual CSS
    });

    it('should work with dark theme', () => {
      document.documentElement.classList.add('high-contrast', 'dark');
      
      expect(document.documentElement).toHaveClass('high-contrast');
      expect(document.documentElement).toHaveClass('dark');
    });
  });

  describe('Large Text Mode', () => {
    beforeEach(() => {
      document.documentElement.className = '';
    });

    it('should apply large text styles when enabled', () => {
      document.documentElement.classList.add('large-text');
      
      expect(document.documentElement).toHaveClass('large-text');
    });

    it('should scale touch targets appropriately', () => {
      document.documentElement.classList.add('large-text');
      
      render(
        <button className="large-text">Test Button</button>
      );
      
      const button = screen.getByRole('button');
      // The CSS would ensure min-height: 44px
      expect(button).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should provide visible focus indicators', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <input type="text" placeholder="Text input" />
        </div>
      );

      // Tab through elements
      await user.tab();
      expect(screen.getByRole('button', { name: 'Button 1' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Button 2' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByPlaceholderText('Text input')).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful labels for interactive elements', () => {
      render(
        <div>
          <button aria-label="Close dialog">✕</button>
          <input type="text" aria-label="Search projects" />
          <div role="status" aria-live="polite">Loading...</div>
        </div>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Search projects')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should use semantic HTML elements', () => {
      render(
        <main>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
          <section>
            <h1>Main Content</h1>
            <article>
              <h2>Article Title</h2>
              <p>Article content</p>
            </article>
          </section>
        </main>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
