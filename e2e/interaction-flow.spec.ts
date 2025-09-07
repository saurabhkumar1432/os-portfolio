import { test, expect } from './fixtures/test-base';
import { VisualRegressionHelper } from './helpers/visual-regression';

test.describe('Interaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="desktop"]')).toBeVisible();
  });

  test('should handle window management operations', async ({ page }) => {
    // Launch an app
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    // Test window dragging
    const titleBar = window.locator('[data-testid="window-title-bar"]');
    await titleBar.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 200, y: 100 }
    });
    
    // Window should move
    const windowBounds = await window.boundingBox();
    expect(windowBounds?.x).toBeCloseTo(200, 50);
    expect(windowBounds?.y).toBeCloseTo(100, 50);
    
    // Test window resizing
    const resizeHandle = window.locator('[data-testid="resize-handle-se"]');
    await resizeHandle.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 800, y: 600 }
    });
    
    // Window should resize
    const newBounds = await window.boundingBox();
    expect(newBounds?.width).toBeGreaterThan(600);
    expect(newBounds?.height).toBeGreaterThan(400);
    
    // Test minimize
    await window.locator('[data-testid="window-minimize"]').click();
    await expect(window).toBeHidden();
    
    // Should show in taskbar
    const taskbarApp = page.locator('[data-testid="taskbar-app-projects"]');
    await expect(taskbarApp).toHaveClass(/minimized/);
    
    // Restore from taskbar
    await taskbarApp.click();
    await expect(window).toBeVisible();
    
    // Test maximize
    await window.locator('[data-testid="window-maximize"]').click();
    
    // Window should be maximized
    const maxBounds = await window.boundingBox();
    const viewportSize = page.viewportSize();
    expect(maxBounds?.width).toBeCloseTo(viewportSize?.width || 0, 50);
    
    // Test close
    await window.locator('[data-testid="window-close"]').click();
    await expect(window).toBeHidden();
    
    // Should not show in taskbar
    await expect(taskbarApp).toBeHidden();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Win key for Start menu
    await page.keyboard.press('Meta');
    await expect(page.locator('[data-testid="start-menu"]')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="start-menu"]')).toBeHidden();
    
    // Launch an app and test shortcuts
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    const window = page.locator('[data-testid="window-projects"]');
    await expect(window).toBeVisible();
    
    // Test Ctrl+W to close
    await page.keyboard.press('Control+w');
    await expect(window).toBeHidden();
    
    // Launch multiple apps for Alt+Tab test
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-terminal"]');
    
    // Test Alt+Tab
    await page.keyboard.down('Alt');
    await page.keyboard.press('Tab');
    
    await expect(page.locator('[data-testid="window-switcher"]')).toBeVisible();
    
    await page.keyboard.up('Alt');
    await expect(page.locator('[data-testid="window-switcher"]')).toBeHidden();
    
    // Test Win+Arrow for snapping
    await page.keyboard.press('Meta+ArrowLeft');
    
    // Window should snap to left half
    const snappedBounds = await page.locator('[data-testid="window-projects"]').boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    expect(snappedBounds?.width).toBeCloseTo(viewportWidth / 2, 50);
  });

  test('should handle desktop interactions', async ({ page }) => {
    // Test right-click context menu
    await page.click('[data-testid="desktop"]', { button: 'right' });
    
    await expect(page.locator('[data-testid="desktop-context-menu"]')).toBeVisible();
    
    // Test context menu options
    await page.click('[data-testid="context-menu-wallpaper"]');
    await expect(page.locator('[data-testid="wallpaper-selector"]')).toBeVisible();
    
    // Close context menu
    await page.click('[data-testid="desktop"]');
    await expect(page.locator('[data-testid="desktop-context-menu"]')).toBeHidden();
    
    // Test desktop icon interactions
    const projectsIcon = page.locator('[data-testid="desktop-icon-projects"]');
    
    // Double-click to launch
    await projectsIcon.dblclick();
    await expect(page.locator('[data-testid="window-projects"]')).toBeVisible();
    
    // Close the window
    await page.locator('[data-testid="window-close"]').click();
    
    // Test icon dragging
    await projectsIcon.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 300, y: 200 }
    });
    
    // Icon should move
    const iconBounds = await projectsIcon.boundingBox();
    expect(iconBounds?.x).toBeCloseTo(300, 50);
    expect(iconBounds?.y).toBeCloseTo(200, 50);
  });

  test('should handle multi-window scenarios', async ({ page }) => {
    // Launch multiple apps
    const apps = ['projects', 'file-explorer', 'terminal', 'notepad'];
    
    for (const app of apps) {
      await page.click('[data-testid="start-button"]');
      await page.click(`[data-testid="app-${app}"]`);
      await expect(page.locator(`[data-testid="window-${app}"]`)).toBeVisible();
    }
    
    // Test focus management
    await page.click('[data-testid="window-projects"] [data-testid="window-content"]');
    
    // Projects window should be focused (on top)
    const projectsWindow = page.locator('[data-testid="window-projects"]');
    const zIndex = await projectsWindow.evaluate(el => getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBeGreaterThan(0);
    
    // Click on another window
    await page.click('[data-testid="window-terminal"] [data-testid="window-content"]');
    
    // Terminal should now be focused
    const terminalWindow = page.locator('[data-testid="window-terminal"]');
    const terminalZIndex = await terminalWindow.evaluate(el => getComputedStyle(el).zIndex);
    expect(parseInt(terminalZIndex)).toBeGreaterThan(parseInt(zIndex));
    
    // Test window snapping with multiple windows
    await page.keyboard.press('Meta+ArrowLeft');
    
    // Terminal should snap to left
    const terminalBounds = await terminalWindow.boundingBox();
    expect(terminalBounds?.x).toBeLessThan(50);
    
    // Focus another window and snap right
    await page.click('[data-testid="window-projects"] [data-testid="window-content"]');
    await page.keyboard.press('Meta+ArrowRight');
    
    // Projects should snap to right
    const projectsBounds = await projectsWindow.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    expect(projectsBounds?.x).toBeGreaterThan(viewportWidth / 2 - 50);
  });

  test('should handle application-specific interactions', async ({ page }) => {
    // Test Projects app interactions
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-projects"]');
    
    // Test project filtering
    await page.click('[data-testid="filter-tech-react"]');
    await expect(page.locator('[data-testid="project-card"]')).toHaveCount(3, { timeout: 5000 });
    
    // Test project detail view
    await page.click('[data-testid="project-card"]').first();
    await expect(page.locator('[data-testid="project-detail"]')).toBeVisible();
    
    // Test Terminal app interactions
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-terminal"]');
    
    // Type a command
    await page.fill('[data-testid="terminal-input"]', 'help');
    await page.keyboard.press('Enter');
    
    // Should show help output
    await expect(page.locator('[data-testid="terminal-output"]')).toContainText('Available commands:');
    
    // Test command history
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('[data-testid="terminal-input"]')).toHaveValue('help');
    
    // Test File Explorer interactions
    await page.click('[data-testid="start-button"]');
    await page.click('[data-testid="app-file-explorer"]');
    
    // Navigate to a folder
    await page.click('[data-testid="folder-projects"]');
    await expect(page.locator('[data-testid="breadcrumb-projects"]')).toBeVisible();
    
    // Test file preview
    await page.click('[data-testid="file-readme"]');
    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
  });
});