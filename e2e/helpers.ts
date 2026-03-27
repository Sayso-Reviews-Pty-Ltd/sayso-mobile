import type { Page } from '@playwright/test';

export const BASE = process.env.E2E_BASE_URL ?? 'https://sayso.co.za';

export async function goToLogin(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.getByPlaceholder('you@example.com');
  if (!(await emailInput.isVisible())) {
    const launchLogin = page.getByText('Log In').first();
    const getStarted = page.getByText('Get Started').first();
    if (await launchLogin.isVisible()) {
      await launchLogin.click();
    } else if (await getStarted.isVisible()) {
      await getStarted.click();
      const loginTab = page.getByText('Login', { exact: true }).first();
      if (await loginTab.isVisible()) {
        await loginTab.click();
      }
    }
    await page.waitForTimeout(500);
  }
}

export async function goToRegister(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForTimeout(300);
}

export async function goToForgotPassword(page: Page) {
  await page.goto(`${BASE}/forgot-password`);
  await page.waitForLoadState('networkidle');
}
