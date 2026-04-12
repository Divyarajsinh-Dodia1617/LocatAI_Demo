import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutCompletePage extends BasePage {
  readonly title: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async goBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
