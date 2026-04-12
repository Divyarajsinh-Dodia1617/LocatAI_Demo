import { test, expect } from '../../src/fixtures/test.fixture';
import { USERS, PRODUCTS, CHECKOUT_INFO } from '../../src/utils/test-data';
import { SORT_OPTIONS, URLS } from '../../src/utils/constants';

test.describe('Complete Purchase Flow', () => {
  test('should complete a full end-to-end purchase', async ({
    page,
    loginPage,
    inventoryPage,
    productDetailPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Login
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await expect(page).toHaveURL(URLS.INVENTORY);

    // 2. Sort products by price low to high
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);
    const prices = await inventoryPage.getProductPrices();
    const firstPrice = parseFloat(prices[0].replace('$', ''));
    const secondPrice = parseFloat(prices[1].replace('$', ''));
    expect(firstPrice).toBeLessThanOrEqual(secondPrice);

    // 3. Add 2 items to cart
    await inventoryPage.addToCart(PRODUCTS.ONESIE.name);
    await inventoryPage.addToCart(PRODUCTS.BIKE_LIGHT.name);
    expect(await inventoryPage.getCartCount()).toBe(2);

    // 4. Open a product detail page, verify, go back
    await inventoryPage.openProduct(PRODUCTS.BACKPACK.name);
    await expect(productDetailPage.productName).toHaveText(PRODUCTS.BACKPACK.name);
    await expect(productDetailPage.productPrice).toHaveText(PRODUCTS.BACKPACK.price);
    await expect(productDetailPage.productImage).toBeVisible();
    await productDetailPage.goBack();
    await expect(page).toHaveURL(URLS.INVENTORY);

    // 5. Go to cart, verify 2 items
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    const cartNames = await cartPage.getItemNames();
    expect(cartNames).toContain(PRODUCTS.ONESIE.name);
    expect(cartNames).toContain(PRODUCTS.BIKE_LIGHT.name);

    // 6. Remove one item
    await cartPage.removeItem(PRODUCTS.ONESIE.name);
    await expect(cartPage.cartItems).toHaveCount(1);
    const remainingNames = await cartPage.getItemNames();
    expect(remainingNames).toEqual([PRODUCTS.BIKE_LIGHT.name]);

    // 7. Checkout — fill info
    await cartPage.checkout();
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    await checkoutInfoPage.fillInfo(
      CHECKOUT_INFO.VALID.firstName,
      CHECKOUT_INFO.VALID.lastName,
      CHECKOUT_INFO.VALID.zipCode,
    );
    await checkoutInfoPage.continue();

    // 8. Verify checkout overview
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    const overviewNames = await checkoutOverviewPage.getItemNames();
    expect(overviewNames).toEqual([PRODUCTS.BIKE_LIGHT.name]);
    await expect(checkoutOverviewPage.paymentInfo).toContainText('SauceCard');
    await expect(checkoutOverviewPage.shippingInfo).toContainText('Free Pony Express');
    await expect(checkoutOverviewPage.subtotal).toContainText('$9.99');
    await expect(checkoutOverviewPage.total).toContainText('$10.79');

    // 9. Finish order
    await checkoutOverviewPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');

    // 10. Go back home and logout
    await checkoutCompletePage.goBackHome();
    await expect(page).toHaveURL(URLS.INVENTORY);
    await inventoryPage.logout();
    await expect(page).toHaveURL(URLS.LOGIN);
  });
});
