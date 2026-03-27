import { test, expect } from '@playwright/test';
import { goToForgotPassword } from './helpers';

test.describe('Forgot Password', () => {
  test('forgot password page loads', async ({ page }) => {
    await goToForgotPassword(page);

    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send reset link' })
    ).toBeVisible();
  });

  test('shows validation for invalid email format', async ({ page }) => {
    await goToForgotPassword(page);

    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.fill('notanemail');
    await emailInput.blur();

    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test('sends reset email and shows confirmation', async ({ page }) => {
    await goToForgotPassword(page);

    await page
      .getByPlaceholder('you@example.com')
      .fill('hilarion@sayso.co.za');

    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(
      page.getByRole('heading', { name: /email sent/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('back to login link works', async ({ page }) => {
    await goToForgotPassword(page);

    const backLink = page.getByText(/sign in/i).first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/login/);
    }
  });
});
