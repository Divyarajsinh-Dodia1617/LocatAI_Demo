/**
 * Self-Healing Mode Tests
 *
 * Every locator here is INTENTIONALLY BROKEN. The first argument to
 * page.locatai.* is a wrong/stale selector that will fail. The second
 * argument is a semantic description that LocatAI uses to find the
 * correct element via AI when the original selector breaks.
 *
 * This simulates a real-world scenario where the frontend team refactors
 * the UI and test selectors go stale — LocatAI heals them automatically.
 */

import { test, expect } from '../../src/fixtures/locatai.fixture';
import { USERS, PRODUCTS, CHECKOUT_INFO } from '../../src/utils/test-data';

test.describe('Self-Healing Mode — Login', () => {
  test('should heal broken login selectors', async ({ page }) => {
    await page.goto('/');

    // These selectors are WRONG — LocatAI will heal them
    await page.locatai.fill(
      page.locator('#wrong-username-id'),
      'Username input field',
      USERS.STANDARD.username,
    );
    await page.locatai.fill(
      page.locator('[data-test="wrong-password"]'),
      'Password input field',
      USERS.STANDARD.password,
    );
    await page.locatai.click(
      page.locator('.nonexistent-login-btn'),
      'Login button',
    );

    await expect(page).toHaveURL(/inventory/);
  });
});

test.describe('Self-Healing Mode — Inventory', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('should heal broken add-to-cart button', async ({ page }) => {
    // Wrong selector — AI heals to the real "Add to cart" for Backpack
    await page.locatai.click(
      page.locator('[data-test="nonexistent-add-button"]'),
      'Add to cart button for Sauce Labs Backpack',
    );

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('should heal broken product link', async ({ page }) => {
    await page.locatai.click(
      page.locator('a.wrong-product-link'),
      'Link to Sauce Labs Backpack product details',
    );

    await expect(page.locator('[data-test="inventory-item-name"]'))
      .toHaveText(PRODUCTS.BACKPACK.name);
  });

  test('should heal broken hamburger menu button', async ({ page }) => {
    await page.locatai.click(
      page.locator('#wrong-menu-id'),
      'Hamburger menu button',
    );

    await expect(page.locator('.bm-menu')).toBeVisible();
  });
});

test.describe('Self-Healing Mode — Cart & Checkout', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    // Add item using regular Playwright (known good selector)
    await inventoryPage.addToCart(PRODUCTS.BACKPACK.name);
    await inventoryPage.goToCart();
  });

  test('should heal broken remove button in cart', async ({ page }) => {
    await page.locatai.click(
      page.locator('[data-test="wrong-remove-button"]'),
      'Remove button for the item in cart',
    );

    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should heal broken checkout form fields', async ({ page, cartPage }) => {
    await cartPage.checkout();

    // All three selectors are WRONG
    await page.locatai.fill(
      page.locator('#wrong-firstname'),
      'First name input',
      CHECKOUT_INFO.VALID.firstName,
    );
    await page.locatai.fill(
      page.locator('#wrong-lastname'),
      'Last name input',
      CHECKOUT_INFO.VALID.lastName,
    );
    await page.locatai.fill(
      page.locator('#wrong-postal'),
      'Zip/Postal Code input with placeholder Zip/Postal Code',
      CHECKOUT_INFO.VALID.zipCode,
    );

    // Continue with broken selector
    await page.locatai.click(
      page.locator('.fake-continue-btn'),
      'Continue button',
    );

    await expect(page).toHaveURL(/checkout-step-two/);
  });
});
