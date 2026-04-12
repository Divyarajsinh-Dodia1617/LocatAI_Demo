/**
 * Mixed Mode Tests
 *
 * Demonstrates the real-world usage pattern: use regular Playwright
 * selectors for your own well-structured components, and LocatAI
 * for flaky third-party widgets or elements that tend to break.
 *
 * Also showcases the `page.locatai.locator()` chainable API.
 */

import { test, expect } from '../../src/fixtures/locatai.fixture';
import { USERS, PRODUCTS } from '../../src/utils/test-data';

test.describe('Mixed Mode — Regular Playwright + LocatAI', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('should mix regular Playwright with AI for shopping', async ({ page }) => {
    // Regular Playwright for stable selectors
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // AI for the second product (simulating a less stable selector)
    await page.locatai.click('', 'Add to cart button for Sauce Labs Bike Light');

    // Regular Playwright for verification
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // AI for navigation
    await page.locatai.click('', 'Shopping cart icon');

    // Regular Playwright for assertions
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(2);
  });

  test('should use locatai.locator() chainable API', async ({ page }) => {
    // The locator() API creates a self-healing locator with a CSS selector
    // + semantic description. If the selector fails, AI takes over.
    // Here the selectors are intentionally WRONG.
    await page.locatai.locator(
      '[data-test="wrong-add-backpack"]',
      'Add to cart button for Sauce Labs Backpack',
    ).click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Navigate to cart with a broken selector
    await page.locatai.locator('.wrong-cart-link', 'Shopping cart link').click();

    // Verify we're on the cart page
    await expect(page).toHaveURL(/cart/);
    const names = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    expect(names).toContain(PRODUCTS.BACKPACK.name);
  });

  test('should logout using AI after regular Playwright actions', async ({ page }) => {
    // Regular Playwright to add items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Use regular Playwright for the menu button (it has pointer interception issues)
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('.bm-menu').waitFor({ state: 'visible' });
    await page.locatai.click('', 'Logout sidebar link');

    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
