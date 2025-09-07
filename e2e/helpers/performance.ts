import { Page } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'puppeteer';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

export async function measureWebVitals(page: Page): Promise<PerformanceMetrics> {
  // Inject Web Vitals measurement script
  await page.addInitScript(() => {
    window.webVitalsData = {};
    
    // FCP measurement
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.webVitalsData.fcp = entry.startTime;
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // LCP measurement
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.webVitalsData.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS measurement
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      window.webVitalsData.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    // FID measurement
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.webVitalsData.fid = entry.processingStart - entry.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });

    // TTFB measurement
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === location.href) {
          window.webVitalsData.ttfb = entry.responseStart - entry.requestStart;
        }
      }
    }).observe({ entryTypes: ['navigation'] });
  });

  return page.evaluate(() => window.webVitalsData) as Promise<PerformanceMetrics>;
}

export async function runLighthouseAudit(url: string) {
  const browser = await launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    logLevel: 'info',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
  });

  await browser.close();

  return {
    performance: lhr.categories.performance.score * 100,
    accessibility: lhr.categories.accessibility.score * 100,
    bestPractices: lhr.categories['best-practices'].score * 100,
    seo: lhr.categories.seo.score * 100,
    pwa: lhr.categories.pwa.score * 100,
    metrics: {
      fcp: lhr.audits['first-contentful-paint'].numericValue,
      lcp: lhr.audits['largest-contentful-paint'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      fid: lhr.audits['max-potential-fid'].numericValue,
      ttfb: lhr.audits['server-response-time'].numericValue,
    }
  };
}