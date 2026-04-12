import { test, expect } from '../src/fixtures/test.fixture';
import { USERS } from '../src/utils/test-data';
import { URLS } from '../src/utils/constants';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login with valid credentials', async ({ page, loginPage }) => {
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  test('should show error for locked out user', async ({ loginPage }) => {
    await loginPage.login(USERS.LOCKED_OUT.username, USERS.LOCKED_OUT.password);
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('should show error for empty credentials', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show error for wrong password', async ({ loginPage }) => {
    await loginPage.login(USERS.STANDARD.username, 'wrong_password');
    await expect(loginPage.errorMessage).toContainText('do not match');
  });
});
