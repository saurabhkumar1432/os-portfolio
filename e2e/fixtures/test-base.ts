import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Extend basic test by providing additional fixtures
export const test = base.extend<{
  makeAxeBuilder: () => AxeBuilder;
}>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('#commonly-reused-element-with-known-issue');
    await use(makeAxeBuilder);
  },
});

export { expect } from '@playwright/test';