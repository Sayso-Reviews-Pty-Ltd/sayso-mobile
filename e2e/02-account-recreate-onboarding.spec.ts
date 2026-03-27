import { expect, test } from '@playwright/test';
import { BASE, goToLogin, signInWithPersonalAccount } from './helpers';

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
    const loginOutcome = await signInWithPersonalAccount(page, email!, password!);

    if (loginOutcome === 'authenticated') {
      await page.goto(`${BASE}/profile`);
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
    }
    // bad_credentials: wrong E2E secrets — error banner already visible from signIn helper

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
        await expect(page.getByRole('heading', { name: 'Check Your Email' })).toBeVisible();
        await page.getByText('Back to login').click();
        await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
      }

      // If registration didn't create an active session (e.g. email already exists),
      // sign in explicitly so onboarding routes are accessible.
      if (/\/login|\/register|\/onboarding/.test(page.url())) {
        const loginTab = page.getByRole('button', { name: 'Login', exact: true });
        if (await loginTab.isVisible()) {
          await loginTab.click();
        }
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
      }
    }

    // 3) Onboarding step 1: interests feedback.
    // ProtectedRoute can show only PageLoader until client auth hydrates — no h2 yet. Prefer
    // InterestSelection copy (always present once the form mounts) over the animated title.
    const interestsPickerHint = page.getByText(/Select \d+ or more to continue/);
    const verifyEmailClientGate = page.getByRole('heading', { name: 'Verify Your Email' });
    const checkEmailHeading = page.getByRole('heading', { name: 'Check Your Email' });

    let interestsStepReady = false;
    for (let attempt = 0; attempt < 3 && !interestsStepReady; attempt++) {
      if (attempt > 0) {
        await goToLogin(page);
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
      }

      await page.goto(`${BASE}/interests`);
      await page.waitForLoadState('networkidle');

      for (let bounce = 0; bounce < 3 && /\/login/i.test(page.url()); bounce++) {
        await goToLogin(page);
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
        await page.goto(`${BASE}/interests`);
        await page.waitForLoadState('networkidle');
      }

      if (/verify-email/i.test(page.url())) {
        await expect(checkEmailHeading).toBeVisible();
        await page.getByText('Back to login').click();
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
        await page.goto(`${BASE}/interests`);
        await page.waitForLoadState('networkidle');
      }

      try {
        await expect(interestsPickerHint.or(verifyEmailClientGate)).toBeVisible({
          timeout: 45_000,
        });
      } catch {
        continue;
      }

      if (await verifyEmailClientGate.isVisible()) {
        await page.getByRole('link', { name: /Go to Email Verification Page/i }).click();
        await page.waitForLoadState('networkidle');
        await page.getByText('Back to login').click();
        expect(await signInWithPersonalAccount(page, email!, password!)).toBe('authenticated');
        continue;
      }

      await expect(interestsPickerHint).toBeVisible({ timeout: 15_000 });
      interestsStepReady = true;
    }

    if (!interestsStepReady) {
      throw new Error(`E2E: interests step did not mount (auth/hydration). URL: ${page.url()}`);
    }

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
