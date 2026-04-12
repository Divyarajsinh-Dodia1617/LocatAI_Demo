/**
 * AI-Only Mode Tests
 *
 * No selectors at all — every call passes an empty string '' as the
 * first argument and a plain-English description as the second.
 * LocatAI finds every element purely from the description.
 *
 * This is useful when you don't have good selectors, want to make
 * tests more readable, or want to test a third-party UI you don't control.
 */

import { test, expect } from '../../src/fixtures/locatai.fixture';
import { USERS, PRODUCTS, CHECKOUT_INFO } from '../../src/utils/test-data';

test.describe('AI-Only Mode — Login', () => {
  test('should login using only descriptions', async ({ page }) => {
    await page.goto('/');

    await page.locatai.fill('', 'Username input field', USERS.STANDARD.username);
    await page.locatai.fill('', 'Password input field', USERS.STANDARD.password);
    await page.locatai.click('', 'Login button');

    await expect(page).toHaveURL(/inventory/);
  });
});

test.describe('AI-Only Mode — Inventory', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('should add item to cart using AI', async ({ page }) => {
    await page.locatai.click('', 'Add to cart button for the first product');

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('should navigate to cart using AI', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.BACKPACK.name);

    await page.locatai.click('', 'Shopping cart icon');

    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
  });

  test('should open product details using AI', async ({ page }) => {
    await page.locatai.click('', 'Link to Sauce Labs Backpack product');

    await expect(page.locator('[data-test="inventory-item-name"]'))
      .toHaveText(PRODUCTS.BACKPACK.name);
  });
});

test.describe('AI-Only Mode — Checkout', () => {
  test('should complete checkout using only AI descriptions', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    // Add item via AI
    await page.locatai.click('', 'Add to cart button for Sauce Labs Backpack');
    await page.locatai.click('', 'Shopping cart link');

    // Cart — proceed to checkout via AI
    await page.locatai.click('', 'Checkout button');

    // Fill checkout form via AI
    await page.locatai.fill('', 'First name input field', CHECKOUT_INFO.VALID.firstName);
    await page.locatai.fill('', 'Last name input field', CHECKOUT_INFO.VALID.lastName);
    await page.locatai.fill('', 'Zip/Postal Code input with placeholder Zip/Postal Code', CHECKOUT_INFO.VALID.zipCode);
    await page.locatai.click('', 'Continue button');

    // Finish order via AI
    await page.locatai.click('', 'Finish button to complete the order');

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
