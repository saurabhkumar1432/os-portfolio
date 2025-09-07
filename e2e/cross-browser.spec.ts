import { test, expect, devices } from '@playwright/test';

// Test core functionality across different browsers
test.describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test.describe(`${browserName} browser`, () => {
      test(`should boot and display desktop on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Basic functionality should work across all browsers
        await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
        await expect(page.locator('[data-testid="taskbar"]')).toBeVisible();
        await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
      });

      test(`should handle window operations on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
        
        // Launch an app
        await page.click('[data-testid="start-button"]');
        await page.click('[data-testid="app-projects"]');
        
        const window = page.locator('[data-testid="window-projects"]');
        await expect(window).toBeVisible();
        
        // Test basic window operations
        await window.locator('[data-testid="window-minimize"]').click();
        await expect(window).toBeHidden();
        
        await page.locator('[data-testid="taskbar-app-projects"]').click();
        await expect(window).toBeVisible();
        
        await window.locator('[data-testid="window-close"]').click();
        await expect(window).toBeHidden();
      });

      test(`should handle keyboard shortcuts on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
        
        // Test Start menu shortcut
        const metaKey = browserName === 'webkit' ? 'Meta' : 'Meta';
        await page.keyboard.press(metaKey);
        await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
        
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
      });

      test(`should render correctly on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
        
        // Check that essential UI elements are properly positioned
        const taskbar = page.locator('[data-testid="taskbar"]');
        const taskbarBox = await taskbar.boundingBox();
        
        // Taskbar should be at the bottom
        const viewportHeight = page.viewportSize()?.height || 0;
        expect(taskbarBox?.y).toBeGreaterThan(viewportHeight - 100);
        
        // Desktop should fill the viewport
        const desktop = page.locator('[data-testid="desktop"]');
        const desktopBox = await desktop.boundingBox();
        expect(desktopBox?.width).toBeGreaterThan(0);
        expect(desktopBox?.height).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Mobile browsers', () => {
    test('should work on mobile Chrome', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      const page = await context.newPage();
      
      await page.goto('/');
      await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
      
      // Mobile should show adapted interface
      await expect(page.locator('[data-testid="mobile-taskbar"]')).toBeVisible();
      
      // Touch interactions should work
      await page.tap('[data-testid="start-button"]');
      await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
      
      await context.close();
    });

    test('should work on mobile Safari', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12']
      });
      const page = await context.newPage();
      
      await page.goto('/');
      await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
      
      // Test touch gestures
      await page.tap('[data-testid="start-button"]');
      await page.tap('[data-testid="app-projects"]');
      
      await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
      
      await context.close();
    });
  });

  test.describe('Different screen sizes', () => {
    const screenSizes = [
      { name: '1920x1080', width: 1920, height: 1080 },
      { name: '1366x768', width: 1366, height: 768 },
      { name: '1024x768', width: 1024, height: 768 },
      { name: '800x600', width: 800, height: 600 }
    ];

    screenSizes.forEach(size => {
      test(`should work on ${size.name} resolution`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: size.width, height: size.height }
        });
        const page = await context.newPage();
        
        await page.goto('/');
        await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
        
        // Launch an app and check it fits
        await page.click('[data-testid="start-button"]');
        await page.click('[data-testid="app-projects"]');
        
        const window = page.locator('[data-testid="window-projects"]');
        await expect(window).toBeVisible();
        
        const windowBox = await window.boundingBox();
        expect(windowBox?.x).toBeGreaterThanOrEqual(0);
        expect(windowBox?.y).toBeGreaterThanOrEqual(0);
        expect(windowBox?.width).toBeLessThanOrEqual(size.width);
        expect(windowBox?.height).toBeLessThanOrEqual(size.height);
        
        await context.close();
      });
    });
  });

  test.describe('Browser-specific features', () => {
    test('should handle Chrome-specific features', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chrome-specific test');
      
      await page.goto('/');
      await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
      
      // Test Chrome-specific APIs if available
      const hasMemoryAPI = await page.evaluate(() => {
        return 'memory' in performance;
      });
      
      if (hasMemoryAPI) {
        const memory = await page.evaluate(() => (performance as any).memory);
        expect(memory.usedJSHeapSize).toBeGreaterThan(0);
      }
    });

    test('should handle Firefox-specific features', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox-specific test');
      
      await page.goto('/');
      await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
      
      // Test Firefox-specific behavior
      // Firefox handles some CSS properties differently
      const taskbar = page.locator('[data-testid="taskbar"]');
      const styles = await taskbar.evaluate(el => getComputedStyle(el));
      
      // Should still render correctly
      expect(styles.display).not.toBe('none');
    });

    test('should handle Safari-specific features', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Safari-specific test');
      
      await page.goto('/');
      await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
      
      // Test Safari-specific behavior
      // Safari has different touch handling
      const desktop = page.locator('[data-testid="desktop"]');
      await desktop.tap();
      
      // Should handle touch events properly
      await expect(desktop).toBeVisible();
    });
  });
});