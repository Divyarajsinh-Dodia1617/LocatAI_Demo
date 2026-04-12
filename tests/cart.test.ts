import { test, expect } from '../src/fixtures/test.fixture';
import { USERS, PRODUCTS } from '../src/utils/test-data';

test.describe('Cart', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventoryPage.addToCart(PRODUCTS.BACKPACK.name);
    await inventoryPage.addToCart(PRODUCTS.BIKE_LIGHT.name);
    await inventoryPage.goToCart();
  });

  test('should display added items in cart', async ({ cartPage }) => {
    await expect(cartPage.cartItems).toHaveCount(2);
    const names = await cartPage.getItemNames();
    expect(names).toContain(PRODUCTS.BACKPACK.name);
    expect(names).toContain(PRODUCTS.BIKE_LIGHT.name);
  });

  test('should display correct prices', async ({ cartPage }) => {
    const prices = await cartPage.getItemPrices();
    expect(prices).toContain(PRODUCTS.BACKPACK.price);
    expect(prices).toContain(PRODUCTS.BIKE_LIGHT.price);
  });

  test('should remove item from cart', async ({ cartPage }) => {
    await cartPage.removeItem(PRODUCTS.BACKPACK.name);
    await expect(cartPage.cartItems).toHaveCount(1);
    const names = await cartPage.getItemNames();
    expect(names).not.toContain(PRODUCTS.BACKPACK.name);
    expect(names).toContain(PRODUCTS.BIKE_LIGHT.name);
  });

  test('should continue shopping', async ({ page, cartPage }) => {
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should proceed to checkout', async ({ page, cartPage }) => {
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});
