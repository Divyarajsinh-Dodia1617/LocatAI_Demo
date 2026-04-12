import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutOverviewPage extends BasePage {
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.subtotal = page.locator('[data-test="subtotal-label"]');
    this.tax = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async getItemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
