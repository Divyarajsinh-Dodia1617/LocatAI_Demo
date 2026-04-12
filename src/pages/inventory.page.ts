import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('[data-test="title"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async sortBy(value: string): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getProductPrices(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-price"]').allTextContents();
  }

  async addToCart(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }).click();
  }
}
