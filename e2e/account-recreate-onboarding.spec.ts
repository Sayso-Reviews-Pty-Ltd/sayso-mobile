import { expect, test } from '@playwright/test';
import { goToLogin } from './helpers';

test.describe('Account reset and onboarding (UI focused)', () => {
  test('delete account, re-register, and complete onboarding with feedback checks', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const email = process.env.E2E_PERSONAL_ACCOUNT_EMAIL;
    const password = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD;
    test.skip(!email || !password, 'E2E_PERSONAL_ACCOUNT credentials not set');

    const username = `e2euser${Date.now().toString().slice(-8)}`;

    // 1) Sign in and delete account from profile.
    await goToLogin(page);
    await page.getByPlaceholder('you@example.com').fill(email!);
    await page.getByPlaceholder(/enter your password/i).fill(password!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    let authenticated = false;
    try {
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
      authenticated = true;
    } catch {
      authenticated = false;
    }

    if (authenticated) {
      await page.goto('https://sayso.co.za/profile');
      await page.waitForLoadState('networkidle');
      const accountActionsCard = page.getByRole('region', { name: /account actions/i });
      if (await accountActionsCard.isVisible()) {
        await page.getByText('Account Actions').scrollIntoViewIfNeeded();
        await accountActionsCard.getByRole('button', { name: 'Delete Account' }).click();

        await expect(page.getByText(/Type DELETE to (confirm|continue)/)).toBeVisible();
        const confirmDeleteBtn = page.getByRole('button', { name: 'Delete Account' }).last();
        await expect(confirmDeleteBtn).toBeDisabled();

        await page.getByRole('textbox', { name: 'DELETE' }).fill('DELETE');
        await expect(confirmDeleteBtn).toBeEnabled();
        await confirmDeleteBtn.click();

        await page.waitForURL((url) => /onboarding|login/.test(url.pathname), {
          timeout: 20_000,
        });
      }
    } else {
      await expect(
        page.getByText('Incorrect email or password. Please try again.').first()
      ).toBeVisible({ timeout: 10_000 });
    }

    // 2) Re-sign up and assert registration form feedback (skip if already mid-onboarding).
    if (!/\/interests|\/subcategories|\/deal-breakers|\/complete/.test(page.url())) {
      if (/\/login/.test(page.url())) {
        await expect(page.getByPlaceholder('you@example.com')).toBeVisible({
          timeout: 10_000,
        });
        await page.getByRole('button', { name: 'Register' }).click();
      } else {
        await expect(page.getByText('Welcome!')).toBeVisible({ timeout: 10_000 });
        await page.getByRole('button', { name: /create account/i }).click();
      }
      await expect(page.getByPlaceholder('Choose a username')).toBeVisible();

      const regUsername = page.getByPlaceholder('Choose a username');
      const regEmail = page.getByPlaceholder('you@example.com');
      const regPassword = page.getByPlaceholder(/create a password/i);
      const createAccountBtn = page.getByRole('button', { name: 'Create account' });

      await regUsername.fill('ab');
      await regUsername.blur();
      await expect(page.getByText('Username must be at least 3 characters')).toBeVisible();

      await regEmail.fill('notanemail');
      await regEmail.blur();
      await expect(page.getByText('Enter a valid email')).toBeVisible();

      await regUsername.fill(username);
      await regEmail.fill(email!);
      await regPassword.fill(password!);
      await expect(createAccountBtn).toBeDisabled();

      const consentToggle = page.getByTestId('consent-toggle');
      if (await consentToggle.isVisible()) {
        await consentToggle.click();
      } else {
        await page
          .getByText('I agree to the')
          .first()
          .click({ position: { x: 6, y: 6 } });
        if (/\/terms|\/privacy/.test(page.url())) {
          await page.goBack();
        }
      }
      await expect(createAccountBtn).toBeEnabled();

      await createAccountBtn.click();
      await page.waitForTimeout(1500);

      // Some environments land on verify-email first; continue by signing in again.
      if (/verify-email/.test(page.url())) {
        await expect(page.getByText('Check Your Email')).toBeVisible();
        await page.getByText('Back to login').click();
        await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
        await page.getByPlaceholder('you@example.com').fill(email!);
        await page.getByPlaceholder(/enter your password/i).fill(password!);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForURL((url) => !url.pathname.includes('/login'), {
          timeout: 15_000,
        });
      }

      // If registration didn't create an active session (e.g. email already exists),
      // sign in explicitly so onboarding routes are accessible.
      if (/\/login|\/register|\/onboarding/.test(page.url())) {
        const loginTab = page.getByRole('button', { name: 'Login' });
        if (await loginTab.isVisible()) {
          await loginTab.click();
        }
        await page.getByPlaceholder('you@example.com').fill(email!);
        await page.getByPlaceholder(/enter your password/i).fill(password!);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForURL((url) => !url.pathname.includes('/login'), {
          timeout: 15_000,
        });
      }
    }

    // 3) Onboarding step 1: interests feedback.
    await page.goto('https://sayso.co.za/interests');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('What interests you?')).toBeVisible();
    await expect(page.getByText('Select 3 or more to continue')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await page.getByText('Food & Drink').first().click();
    await page.getByText('Beauty & Wellness').first().click();
    await page.getByText('Arts & Culture').first().click();
    await expect(page.getByText('3 of 3-6 selected')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
    await page.getByRole('button', { name: 'Continue' }).click();

    // 4) Onboarding step 2: subcategories feedback.
    await expect(page.getByText("Let's Get More Specific!")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await page.getByText('Restaurants').first().click();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
    await page.getByRole('button', { name: 'Continue' }).click();

    // 5) Onboarding step 3: deal-breakers feedback.
    await expect(page.getByText('What are your dealbreakers?')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Select at least one deal-breaker to continue')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Complete Setup' })).toBeDisabled();
    await page.getByText('Trustworthiness').first().click();
    await expect(page.getByRole('button', { name: 'Complete Setup' })).toBeEnabled();
    await page.getByRole('button', { name: 'Complete Setup' }).click();

    // 6) Completion step feedback and redirect.
    await expect(page.getByText("You're all set!")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Setup Complete')).toBeVisible();
    await page.waitForURL((url) => /home|for-you|trending/.test(url.pathname), {
      timeout: 20_000,
    });
  });
});
