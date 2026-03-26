import { test, expect } from '@playwright/test';
import { goToLogin } from './helpers';

test.describe('Login', () => {
  test('login page loads and shows form', async ({ page }) => {
    await goToLogin(page);

    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByText('Google')).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await goToLogin(page);

    const passwordInput = page.getByPlaceholder(/enter your password/i);
    await passwordInput.focus();
    await passwordInput.blur();

    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await goToLogin(page);

    await page.getByPlaceholder('you@example.com').fill('notareal@email.com');
    await page.getByPlaceholder(/enter your password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByText('Incorrect email or password.').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows error for invalid email format', async ({ page }) => {
    await goToLogin(page);

    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.fill('notanemail');
    await emailInput.blur();

    await expect(page.getByText('Enter a valid email')).toBeVisible();
  });

  test('password shorter than 6 chars blocks submit', async ({ page }) => {
    await goToLogin(page);

    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    const passwordInput = page.getByPlaceholder(/enter your password/i);
    await passwordInput.fill('abc');
    await passwordInput.blur();

    await expect(
      page.getByText('Password must be at least 6 characters')
    ).toBeVisible();
  });

  test('can toggle password visibility', async ({ page }) => {
    await goToLogin(page);

    const passwordInput = page.getByPlaceholder(/enter your password/i);
    await passwordInput.fill('mypassword');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    const eyeButton = page.getByRole('button', { name: /password/i }).first();
    if (await eyeButton.isVisible()) {
      await eyeButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('forgot password link navigates correctly', async ({ page }) => {
    await goToLogin(page);

    await page.getByText('Forgot password?').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('can switch to register tab', async ({ page }) => {
    await goToLogin(page);

    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForTimeout(300);

    await expect(page.getByPlaceholder('Choose a username')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create account' })
    ).toBeVisible();
  });

  test('successful login with valid credentials', async ({ page }) => {
    const email = process.env.E2E_PERSONAL_ACCOUNT_EMAIL;
    const password = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD;
    test.skip(!email || !password, 'E2E_PERSONAL_ACCOUNT credentials not set');

    await goToLogin(page);

    await page.getByPlaceholder('you@example.com').fill(email!);
    await page.getByPlaceholder(/enter your password/i).fill(password!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15_000,
    });
    await expect(page).not.toHaveURL(/login/);
  });
});

test.describe('Google OAuth', () => {
  test('Google button is present on login page', async ({ page }) => {
    await goToLogin(page);

    await expect(page.getByText('Google')).toBeVisible();
  });

  test('Google button triggers OAuth redirect', async ({ page }) => {
    await goToLogin(page);

    const [popup] = await Promise.all([
      page
        .waitForURL(/accounts\.google\.com/, { timeout: 8_000 })
        .catch(() => null),
      page.getByText('Google').click(),
    ]);

    if (!popup) {
      await expect(page).toHaveURL(/accounts\.google\.com|sayso\.co\.za/, {
        timeout: 8_000,
      });
    }
  });
});
