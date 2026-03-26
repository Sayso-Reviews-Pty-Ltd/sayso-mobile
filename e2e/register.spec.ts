import { test, expect } from '@playwright/test';
import { goToRegister } from './helpers';

test.describe('Register', () => {
  test('register form shows username, email, password fields', async ({
    page,
  }) => {
    await goToRegister(page);

    await expect(page.getByPlaceholder('Choose a username')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder(/create a password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create account' })
    ).toBeVisible();
  });

  test('validates username — too short', async ({ page }) => {
    await goToRegister(page);

    const usernameInput = page.getByPlaceholder('Choose a username');
    await usernameInput.fill('ab');
    await usernameInput.blur();

    await expect(
      page.getByText('Username must be at least 3 characters')
    ).toBeVisible();
  });

  test('validates username — invalid characters', async ({ page }) => {
    await goToRegister(page);

    const usernameInput = page.getByPlaceholder('Choose a username');
    await usernameInput.fill('hello world!');
    await usernameInput.blur();

    await expect(
      page.getByText(/username can only contain letters, numbers/i)
    ).toBeVisible();
  });

  test('validates username — too long', async ({ page }) => {
    await goToRegister(page);

    const usernameInput = page.getByPlaceholder('Choose a username');
    await usernameInput.fill('a'.repeat(21));
    await usernameInput.blur();

    await expect(
      page.getByText(/username must be less than 20 characters/i)
    ).toBeVisible();
  });

  test('validates email — invalid format', async ({ page }) => {
    await goToRegister(page);

    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.fill('notvalid');
    await emailInput.blur();

    await expect(page.getByText('Enter a valid email')).toBeVisible();
  });

  test('create account button disabled without consent', async ({ page }) => {
    await goToRegister(page);

    await page.getByPlaceholder('Choose a username').fill('testuser123');
    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');

    const submitBtn = page.getByRole('button', { name: 'Create account' });
    await expect(submitBtn).toBeDisabled();
  });

  // FIXME: RegisterForm.tsx in sayso-web has `const isLoading = true` (hardcoded),
  // which permanently disables the submit button. The fix (use authLoading instead)
  // is applied in sayso-web/src/app/components/Register/RegisterForm.tsx — this
  // test will pass once that change is deployed to sayso.co.za.
  test.fixme('create account enabled with all valid fields and consent', async ({
    page,
  }) => {
    await goToRegister(page);

    // Use a timestamp-based username to avoid "already taken" responses from
    // the availability check, which keep the submit button disabled
    const uniqueUsername = `e2etest${Date.now()}`;
    await page.getByPlaceholder('Choose a username').fill(uniqueUsername);
    await page.getByPlaceholder('you@example.com').fill('e2e@sayso-test.com');
    await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');

    const consentCheckbox = page
      .locator('[data-testid="consent-toggle"]')
      .first();
    if (await consentCheckbox.isVisible()) {
      await consentCheckbox.click();
    } else {
      await page.getByText('I agree to the').click();
    }

    const submitBtn = page.getByRole('button', { name: 'Create account' });
    // Allow up to 8s for the async username availability check to resolve
    await expect(submitBtn).not.toBeDisabled({ timeout: 8_000 });
  });

  test('can switch back to login tab', async ({ page }) => {
    await goToRegister(page);

    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(300);

    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
  });
});
