import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('navigates through main tabs', async ({ page }) => {
    // Navigate to dashboard (will redirect to login if unauth)
    await page.goto('/dashboard');
    
    // Check redirection to sign-in
    await expect(page).toHaveURL(/.*sign-in/);

    // Note: To test actual dashboard navigation, we need to:
    // 1. Mock Supabase Auth
    // 2. Or use a test account
    // 3. Or use a global setup that logs in once
  });
});

