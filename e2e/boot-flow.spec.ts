import { test, expect } from './fixtures/test-base';
import { measureWebVitals } from './helpers/performance';
import { VisualRegressionHelper } from './helpers/visual-regression';

test.describe('Boot Flow', () => {
  test('should boot successfully and display desktop', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the desktop to be visible
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Check that essential elements are present
    await expect(page.locator('[data-testid="taskbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-icons"]')).toBeVisible();
    
    // Measure boot time
    const bootTime = Date.now() - startTime;
    expect(bootTime).toBeLessThan(2500); // Should boot within 2.5 seconds
    
    // Take screenshot for visual regression
    const visual = new VisualRegressionHelper(page);
    await visual.waitForStableLayout();
    await visual.compareScreenshot('desktop-boot');
  });

  test('should load with proper performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Wait for desktop to be ready
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Measure Web Vitals
    const metrics = await measureWebVitals(page);
    
    // Assert performance requirements (Requirements 13.1, 13.2)
    expect(metrics.fcp).toBeLessThan(1800); // FCP under 1.8s
    expect(metrics.lcp).toBeLessThan(2500); // LCP under 2.5s
    expect(metrics.cls).toBeLessThan(0.1); // CLS under 0.1
    
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100); // FID under 100ms
    }
  });

  test('should display loading states properly', async ({ page }) => {
    // Throttle network to see loading states
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/');
    
    // Should show loading spinner initially
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible();
    
    // Loading should complete
    await expect(loadingSpinner).toBeHidden({ timeout: 10000 });
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should handle offline scenarios gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Should still load the shell
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    await page.reload();
    
    // Should work normally
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeHidden();
  });
});