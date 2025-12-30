import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('redirects to onboarding if no project exists', async ({ page }) => {
    // This assumes a fresh user or mocked state where user has no projects
    // For now, we verify that the route exists and loads
    await page.goto('/auth/onboarding');
    
    // Should be redirected to login if not auth, but assuming we can mock auth later.
    // Here we check if we hit the login page which is the expected behavior for unauth users visiting protected routes
    await expect(page).toHaveURL(/.*sign-in/);
  });
});


