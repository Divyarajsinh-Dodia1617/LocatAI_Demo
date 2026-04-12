import { type Page, type Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  // Common header elements
  readonly burgerMenuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly logo: Locator;

  // Sidebar menu
  readonly sidebarMenu: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;
  readonly closeSidebarButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.logo = page.locator('.app_logo');

    this.sidebarMenu = page.locator('.bm-menu');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetLink = page.locator('#reset_sidebar_link');
    this.closeSidebarButton = page.locator('#react-burger-cross-btn');
  }

  async openSidebar(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.sidebarMenu.waitFor({ state: 'visible' });
  }

  async closeSidebar(): Promise<void> {
    await this.closeSidebarButton.click();
    await this.sidebarMenu.waitFor({ state: 'hidden' });
  }

  async logout(): Promise<void> {
    await this.openSidebar();
    await this.logoutLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async getCartCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      const text = await this.cartBadge.textContent();
      return parseInt(text ?? '0', 10);
    }
    return 0;
  }
}
