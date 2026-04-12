import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async getItemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getItemPrices(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-price"]').allTextContents();
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
