import { test, expect } from '../src/fixtures/test.fixture';
import { USERS, PRODUCTS } from '../src/utils/test-data';
import { SORT_OPTIONS } from '../src/utils/constants';

test.describe('Inventory', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('should display 6 products', async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('should sort products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);
    const prices = await inventoryPage.getProductPrices();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1]);
    }
  });

  test('should sort products by name Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.NAME_DESC);
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('should add product to cart and show badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.BACKPACK.name);
    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test('should remove product from cart on inventory page', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.BACKPACK.name);
    expect(await inventoryPage.getCartCount()).toBe(1);

    await inventoryPage.removeFromCart(PRODUCTS.BACKPACK.name);
    expect(await inventoryPage.getCartCount()).toBe(0);
  });

  test('should navigate to product detail page', async ({ page, inventoryPage }) => {
    await inventoryPage.openProduct(PRODUCTS.BACKPACK.name);
    await expect(page).toHaveURL(/inventory-item/);
  });
});
