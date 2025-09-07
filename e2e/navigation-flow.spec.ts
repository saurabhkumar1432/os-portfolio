import { test, expect } from './fixtures/test-base';
import { VisualRegressionHelper } from './helpers/visual-regression';

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should open and navigate Start menu', async ({ page }) => {
    // Click Start button
    await page.click('[data-testid="start-button"]');
    
    // Start menu should be visible
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    // Should show app list
    await expect(page.locator('[data-testid="app-list"]')).toBeVisible();
    
    // Should show search box
    await expect(page.locator('[data-testid="start-search"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="start-search"]', 'projects');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-projects"]')).toBeVisible();
    
    // Clear search
    await page.fill('[data-testid="start-search"]', '');
    await expect(page.locator('[data-testid="app-list"]')).toBeVisible();
    
    // Close Start menu by clicking outside
    await page.click('[data-testid="desktop"]');
    await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
  });

  test('should launch applications from Start menu', async ({ page }) => {
    // Open Start menu
    await page.click('[data-testid="start-button"]');
    
    // Launch Projects app
    await page.click('[data-testid="app-projects"]');
    
    // Window should open
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    
    // Taskbar should show running app
    await expect(page.locator('[data-testid="taskbar-app-projects"]')).toBeVisible();
    
    // Start menu should close
    await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
  });

  test('should navigate between applications', async ({ page }) => {
    // Launch multiple apps
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-file-explorer"]');
    
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-terminal"]');
    
    // Should have multiple windows
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="window-file-explorer"]')).toBeVisible();
    await expect(page.locator('[data-testid="window-terminal"]')).toBeVisible();
    
    // Test Alt+Tab navigation
    await page.keyboard.press('Alt+Tab');
    
    // Should show window switcher
    await expect(page.locator('[data-testid="window-switcher"]')).toBeVisible();
    
    // Release Alt to select window
    await page.keyboard.up('Alt');
    
    // Window switcher should close
    await expect(page.locator('[data-testid="window-switcher"]')).toBeHidden();
  });

  test('should handle deep linking', async ({ page }) => {
    // Navigate to a specific project
    await page.goto('/projects/portfolio-website');
    
    // Should open Projects app with specific project
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-detail-portfolio-website"]')).toBeVisible();
    
    // URL should be correct
    expect(page.url()).toContain('/projects/portfolio-website');
    
    // Navigate to file explorer path
    await page.goto('/files/documents');
    
    // Should open File Explorer at Documents
    await expect(page.locator('[data-testid="window-file-explorer"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumb-documents"]')).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Open Projects app and navigate to a project
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await page.click('[data-testid="project-card-portfolio-website"]');
    
    // Open another app
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-notepad"]');
    
    // Type some content in notepad
    await page.fill('[data-testid="notepad-editor"]', 'Test content');
    
    // Switch back to Projects
    await page.click('[data-testid="taskbar-app-projects"]');
    
    // Should still show the project detail
    await expect(page.locator('[data-testid="project-detail-portfolio-website"]')).toBeVisible();
    
    // Switch back to Notepad
    await page.click('[data-testid="taskbar-app-notepad"]');
    
    // Content should be preserved
    await expect(page.locator('[data-testid="notepad-editor"]')).toHaveValue('Test content');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through the app
    await page.goto('/projects');
    await page.click('[data-testid="project-card-portfolio-website"]');
    
    // Use browser back
    await page.goBack();
    
    // Should be back at projects list
    await expect(page.locator('[data-testid="projects-grid"]')).toBeVisible();
    
    // Use browser forward
    await page.goForward();
    
    // Should be back at project detail
    await expect(page.locator('[data-testid="project-detail-portfolio-website"]')).toBeVisible();
  });
});