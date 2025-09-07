import { Page, expect } from '@playwright/test';

export interface ScreenshotOptions {
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  mask?: string[];
  threshold?: number;
}

export class VisualRegressionHelper {
  constructor(private page: Page) {}

  async compareScreenshot(
    name: string, 
    options: ScreenshotOptions = {}
  ) {
    const { fullPage = false, clip, mask = [], threshold = 0.2 } = options;
    
    // Mask dynamic elements
    const defaultMasks = [
      '[data-testid="clock"]', // System clock
      '[data-testid="loading-spinner"]', // Loading states
      '.animate-pulse', // Pulse animations
    ];
    
    const allMasks = [...defaultMasks, ...mask];
    
    // Wait for animations to complete
    await this.page.waitForTimeout(500);
    
    // Hide cursors and focus rings for consistent screenshots
    await this.page.addStyleTag({
      content: `
        *, *:focus, *:hover {
          cursor: none !important;
          outline: none !important;
        }
        .focus-ring {
          box-shadow: none !important;
        }
      `
    });

    const screenshotOptions: any = {
      fullPage,
      threshold,
      mask: allMasks.length > 0 ? await Promise.all(
        allMasks.map(selector => this.page.locator(selector).first())
      ) : undefined,
    };

    if (clip) {
      screenshotOptions.clip = clip;
    }

    await expect(this.page).toHaveScreenshot(`${name}.png`, screenshotOptions);
  }

  async compareElementScreenshot(
    selector: string,
    name: string,
    options: Omit<ScreenshotOptions, 'fullPage' | 'clip'> = {}
  ) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    
    const { mask = [], threshold = 0.2 } = options;
    
    await expect(element).toHaveScreenshot(`${name}.png`, {
      threshold,
      mask: mask.length > 0 ? await Promise.all(
        mask.map(sel => this.page.locator(sel).first())
      ) : undefined,
    });
  }

  async waitForStableLayout(timeout = 5000) {
    // Wait for layout to stabilize by checking if elements stop moving
    let previousBounds: any = null;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const bounds = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid]');
        return Array.from(elements).map(el => {
          const rect = el.getBoundingClientRect();
          return {
            id: el.getAttribute('data-testid'),
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        });
      });
      
      if (previousBounds && JSON.stringify(bounds) === JSON.stringify(previousBounds)) {
        break;
      }
      
      previousBounds = bounds;
      await this.page.waitForTimeout(100);
    }
  }
}