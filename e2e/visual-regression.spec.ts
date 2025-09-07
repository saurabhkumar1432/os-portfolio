import { test, expect } from './fixtures/test-base';
import { VisualRegressionHelper } from './helpers/visual-regression';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should match desktop layout screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Wait for layout to stabilize
    await visual.waitForStableLayout();
    
    // Take full desktop screenshot
    await visual.compareScreenshot('desktop-layout', {
      fullPage: true,
      mask: ['[data-testid="clock"]'] // Mask dynamic clock
    });
  });

  test('should match Start menu screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Open Start menu
    await page.click('[data-testid="start-button"]');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="start-menu"]', 'start-menu');
    
    // Test with search results
    await page.fill('[data-testid="start-search"]', 'projects');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    await visual.compareElementScreenshot('[data-testid="start-menu"]', 'start-menu-search');
  });

  test('should match window screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Launch Projects app
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="window-projects"]', 'projects-window');
    
    // Test maximized state
    await window.locator('[data-testid="window-maximize"]').click();
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="window-projects"]', 'projects-window-maximized');
  });

  test('should match application content screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Test Projects app content
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await expect(page.locator('[data-testid="projects-grid"]')).toBeVisible();
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="projects-grid"]', 'projects-grid');
    
    // Test project detail view
    await page.click('[data-testid="project-card"]').first();
    await expect(page.locator('[data-testid="project-detail"]')).toBeVisible();
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="project-detail"]', 'project-detail');
    
    // Test Terminal app
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-terminal"]');
    
    await expect(page.locator('[data-testid="terminal-content"]')).toBeVisible();
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="terminal-content"]', 'terminal-content');
    
    // Type a command and compare output
    await page.fill('[data-testid="terminal-input"]', 'help');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await visual.compareElementScreenshot('[data-testid="terminal-content"]', 'terminal-help-output');
  });

  test('should match theme variations', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Test light theme (default)
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-light-theme', { fullPage: true });
    
    // Switch to dark theme
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-settings"]');
    
    await expect(page.locator('[data-testid="theme-selector"]')).toBeVisible();
    await page.click('[data-testid="theme-dark"]');
    
    // Wait for theme transition
    await page.waitForTimeout(1000);
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-dark-theme', { fullPage: true });
    
    // Test high contrast mode
    await page.click('[data-testid="theme-high-contrast"]');
    await page.waitForTimeout(1000);
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-high-contrast-theme', { fullPage: true });
  });

  test('should match responsive layouts', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-tablet', { fullPage: true });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-mobile', { fullPage: true });
    
    // Test mobile Start menu
    await page.tap('[data-testid="start-button"]');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    await visual.waitForStableLayout();
    await visual.compareElementScreenshot('[data-testid="start-menu"]', 'start-menu-mobile');
  });

  test('should match context menu screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Desktop context menu
    await page.click('[data-testid="desktop"]', { button: 'right' });
    await expect(page.locator('[data-testid="desktop-context-menu"]')).toBeVisible();
    
    await visual.compareElementScreenshot('[data-testid="desktop-context-menu"]', 'desktop-context-menu');
    
    // Close context menu
    await page.click('[data-testid="desktop"]');
    
    // Window context menu
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    await window.locator('[data-testid="window-title-bar"]').click({ button: 'right' });
    await expect(page.locator('[data-testid="window-context-menu"]')).toBeVisible();
    
    await visual.compareElementScreenshot('[data-testid="window-context-menu"]', 'window-context-menu');
  });

  test('should match error state screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Simulate network error
    await page.route('**/api/**', route => route.abort());
    
    // Try to load content that would fail
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    // Wait for error state
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    
    await visual.compareElementScreenshot('[data-testid="error-boundary"]', 'error-state');
    
    // Test 404 state
    await page.goto('/nonexistent-route');
    await expect(page.locator('[data-testid="not-found"]')).toBeVisible();
    
    await visual.compareElementScreenshot('[data-testid="not-found"]', '404-state');
  });

  test('should match loading state screenshots', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Slow down network to capture loading states
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    const loadingPromise = page.goto('/');
    
    // Capture loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await visual.compareElementScreenshot('[data-testid="loading-spinner"]', 'loading-spinner');
    
    await loadingPromise;
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should match animation states', async ({ page }) => {
    const visual = new VisualRegressionHelper(page);
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    // Test window opening animation (frozen state)
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    await visual.compareElementScreenshot('[data-testid="window-projects"]', 'window-opened-state');
    
    // Test minimized state
    await page.locator('[data-testid="window-minimize"]').click();
    await visual.compareScreenshot('window-minimized-state', { fullPage: true });
  });
});