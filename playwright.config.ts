import {devices} from '@playwright/test';
import type {PlaywrightTestConfig} from '@playwright/test';

const isCI = !!process.env.CI; // Check if running in CI
const baseURL = isCI ? process.env.BASE_URL : "http://localhost:3000";


const config: PlaywrightTestConfig = {
  webServer: {
    port: 3000,
    command: 'yarn docusaurus serve',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  reporter: [
    // Use "dot" reporter on CI, "list" otherwise (Playwright default).
    process.env.CI ? ["dot"] : ["list"],
    // Add Argos reporter.
    [
      "@argos-ci/playwright/reporter",
      {
        // Upload to Argos on CI only.
        uploadToArgos: isCI,

        // Set your Argos token.
        token: process.env.ARGOS_TOKEN,
      },
    ],
  ],

  use: {
    // On CI, we will set `BASE_URL` from Vercel preview URL
    baseURL: baseURL,
    extraHTTPHeaders: {
        // Hide Vercel Toolbar in tests
        "x-vercel-skip-toolbar": "0",
    },
  },
  
};

export default config;
