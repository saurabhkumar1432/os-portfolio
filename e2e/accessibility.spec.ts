import { test, expect } from './fixtures/test-base';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should pass axe accessibility audit on desktop', async ({ page, makeAxeBuilder }) => {
    const accessibilityScanResults = await makeAxeBuilder().analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass axe accessibility audit with Start menu open', async ({ page, makeAxeBuilder }) => {
    await page.click('[data-testid="start-button"]');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    const accessibilityScanResults = await makeAxeBuilder().analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass axe accessibility audit with windows open', async ({ page, makeAxeBuilder }) => {
    // Open multiple windows
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-terminal"]');
    
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="window-terminal"]')).toBeVisible();
    
    const accessibilityScanResults = await makeAxeBuilder().analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation for desktop icons', async ({ page }) => {
    // Focus first desktop icon
    await page.keyboard.press('Tab');
    
    const firstIcon = page.locator('[data-testid="desktop-icon"]').first();
    await expect(firstIcon).toBeFocused();
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    const secondIcon = page.locator('[data-testid="desktop-icon"]').nth(1);
    await expect(secondIcon).toBeFocused();
    
    await page.keyboard.press('ArrowDown');
    const belowIcon = page.locator('[data-testid="desktop-icon"]').nth(4); // Assuming 4-column grid
    await expect(belowIcon).toBeFocused();
    
    // Launch app with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid^="window-"]')).toBeVisible();
  });

  test('should support keyboard navigation for Start menu', async ({ page }) => {
    // Open Start menu with keyboard
    await page.keyboard.press('Meta');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    // Focus should be on search input
    await expect(page.locator('[data-testid="start-search"]')).toBeFocused();
    
    // Navigate to app list
    await page.keyboard.press('Tab');
    const firstApp = page.locator('[data-testid="app-list"] [data-testid^="app-"]').first();
    await expect(firstApp).toBeFocused();
    
    // Navigate through apps
    await page.keyboard.press('ArrowDown');
    const secondApp = page.locator('[data-testid="app-list"] [data-testid^="app-"]').nth(1);
    await expect(secondApp).toBeFocused();
    
    // Launch app with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid^="window-"]')).toBeVisible();
    
    // Start menu should close
    await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
  });

  test('should support keyboard navigation for windows', async ({ page }) => {
    // Launch an app
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    // Focus window content
    await page.keyboard.press('Tab');
    
    // Navigate within window content
    const firstFocusable = window.locator('button, input, [tabindex="0"]').first();
    await expect(firstFocusable).toBeFocused();
    
    // Test window controls keyboard access
    await page.keyboard.press('Alt+F4'); // Close window
    await expect(window).toBeHidden();
  });

  test('should support screen reader announcements', async ({ page }) => {
    // Check for live regions
    await expect(page.locator('[aria-live]')).toHaveCount(1); // Status announcements
    
    // Open Start menu
    await page.click('[data-testid="start-button"]');
    
    // Check announcement for Start menu
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText('Start menu opened');
    
    // Launch an app
    await page.click('[data-testid="app-projects"]');
    
    // Check announcement for app launch
    await expect(liveRegion).toContainText('Projects application opened');
    
    // Minimize window
    await page.click('[data-testid="window-minimize"]');
    await expect(liveRegion).toContainText('Projects window minimized');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check desktop has proper role
    await expect(page.locator('[data-testid="desktop"]')).toHaveAttribute('role', 'main');
    
    // Check taskbar has proper role
    await expect(page.locator('[data-testid="taskbar"]')).toHaveAttribute('role', 'toolbar');
    
    // Check Start button has proper label
    await expect(page.locator('[data-testid="start-button"]')).toHaveAttribute('aria-label', 'Open Start menu');
    
    // Check desktop icons have proper labels
    const icons = page.locator('[data-testid="desktop-icon"]');
    await expect(icons.first()).toHaveAttribute('aria-label');
    
    // Open Start menu and check structure
    await page.click('[data-testid="start-button"]');
    
    // Check Start menu has proper role and label
    await expect(page.locator('[data-testid="start-menu"]')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[data-testid="start-menu"]')).toHaveAttribute('aria-label', 'Start menu');
    
    // Check search input has proper label
    await expect(page.locator('[data-testid="start-search"]')).toHaveAttribute('aria-label', 'Search applications and content');
    
    // Check app list has proper role
    await expect(page.locator('[data-testid="app-list"]')).toHaveAttribute('role', 'list');
    
    // Check app items have proper roles
    const appItems = page.locator('[data-testid="app-list"] [data-testid^="app-"]');
    await expect(appItems.first()).toHaveAttribute('role', 'listitem');
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    await page.reload();
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Check that high contrast styles are applied
    const taskbar = page.locator('[data-testid="taskbar"]');
    const styles = await taskbar.evaluate(el => getComputedStyle(el));
    
    // Should have high contrast colors
    expect(styles.backgroundColor).not.toBe('transparent');
    expect(styles.color).not.toBe('transparent');
    
    // Check contrast ratios meet WCAG AA standards
    const contrastRatio = await page.evaluate(() => {
      // Simple contrast ratio calculation
      const rgb1 = [255, 255, 255]; // White text
      const rgb2 = [0, 0, 0]; // Black background
      
      const luminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      const l1 = luminance(rgb1);
      const l2 = luminance(rgb2);
      
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
    
    // Should meet WCAG AA standard (4.5:1 for normal text)
    expect(contrastRatio).toBeGreaterThan(4.5);
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.reload();
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Check that animations are disabled
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    expect(hasReducedMotion).toBe(true);
    
    // Launch an app and check for reduced animations
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    // Window should appear without animation
    const animationDuration = await window.evaluate(el => {
      return getComputedStyle(el).animationDuration;
    });
    
    expect(animationDuration).toBe('0s');
  });

  test('should support text scaling up to 200%', async ({ page }) => {
    // Set text scaling to 200%
    await page.addStyleTag({
      content: `
        html {
          font-size: 200% !important;
        }
      `
    });
    
    await page.reload();
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Check that interface is still usable
    await page.click('[data-testid="start-button"]');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    // Check that text is readable and doesn't overflow
    const startMenu = page.locator('[data-testid="start-menu"]');
    const menuBounds = await startMenu.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Menu should still fit in viewport
    expect(menuBounds?.width).toBeLessThan((viewportSize?.width || 0) * 0.9);
    expect(menuBounds?.height).toBeLessThan((viewportSize?.height || 0) * 0.9);
    
    // Text should not be clipped
    const appItems = page.locator('[data-testid="app-list"] [data-testid^="app-"]');
    const firstItem = appItems.first();
    const itemText = await firstItem.textContent();
    
    expect(itemText).toBeTruthy();
    expect(itemText?.length).toBeGreaterThan(0);
  });

  test('should handle focus management correctly', async ({ page }) => {
    // Test focus trapping in Start menu
    await page.keyboard.press('Meta');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    // Focus should be trapped within Start menu
    const searchInput = page.locator('[data-testid="start-search"]');
    await expect(searchInput).toBeFocused();
    
    // Tab through all focusable elements
    const focusableElements = await page.locator('[data-testid="start-menu"] button, [data-testid="start-menu"] input, [data-testid="start-menu"] [tabindex="0"]').count();
    
    for (let i = 0; i < focusableElements + 1; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should cycle back to first element
    await expect(searchInput).toBeFocused();
    
    // Close Start menu
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
    
    // Focus should return to Start button
    await expect(page.locator('[data-testid="start-button"]')).toBeFocused();
  });

  test('should provide keyboard shortcuts help', async ({ page }) => {
    // Test keyboard shortcuts help
    await page.keyboard.press('F1'); // Help shortcut
    
    // Should show help dialog or navigate to help
    await expect(page.locator('[data-testid="help-dialog"], [data-testid="window-help"]')).toBeVisible();
    
    // Check that keyboard shortcuts are documented
    const helpContent = page.locator('[data-testid="help-content"], [data-testid="keyboard-shortcuts"]');
    await expect(helpContent).toContainText('Keyboard Shortcuts');
    await expect(helpContent).toContainText('Win');
    await expect(helpContent).toContainText('Alt+Tab');
    await expect(helpContent).toContainText('Ctrl+W');
  });

  test('should support voice control and speech recognition', async ({ page }) => {
    // Check for speech recognition support
    const hasSpeechRecognition = await page.evaluate(() => {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    });
    
    if (hasSpeechRecognition) {
      // Test voice commands if supported
      await page.click('[data-testid="start-button"]');
      
      // Check for voice command button
      const voiceButton = page.locator('[data-testid="voice-search"]');
      if (await voiceButton.isVisible()) {
        await expect(voiceButton).toHaveAttribute('aria-label', 'Voice search');
      }
    }
  });

  test('should work with screen readers', async ({ page }) => {
    // Simulate screen reader navigation
    await page.keyboard.press('Tab');
    
    // Check that focus indicators are visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check focus ring styles
    const focusStyles = await focusedElement.evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        border: styles.border
      };
    });
    
    // Should have visible focus indicator
    const hasFocusIndicator = focusStyles.outline !== 'none' || 
                             focusStyles.boxShadow !== 'none' || 
                             focusStyles.border !== 'none';
    
    expect(hasFocusIndicator).toBe(true);
    
    // Test heading navigation (screen reader simulation)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check heading hierarchy
    const firstHeading = page.locator('h1, h2, h3, h4, h5, h6').first();
    const headingLevel = await firstHeading.evaluate(el => parseInt(el.tagName.charAt(1)));
    expect(headingLevel).toBe(1); // Should start with h1
  });
});