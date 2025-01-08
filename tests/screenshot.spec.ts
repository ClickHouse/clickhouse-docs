import * as fs from 'fs';
import { argosScreenshot } from '@argos-ci/playwright';
import { test } from '@playwright/test';
import axios from 'axios';
import { extractSitemapPathnames, pathnameToArgosName } from './utils';

// Constants
const siteUrl = process.env.CI ? process.env.BASE_URL : 'http://localhost:3000';
const sitemapUrl = `${siteUrl}/docs/sitemap.xml`;
const stylesheetPath = './tests/screenshot.css';
const stylesheet = fs.readFileSync(stylesheetPath).toString();

// Wait for hydration, requires Docusaurus v2.4.3+
// Docusaurus adds a <html data-has-hydrated="true"> once hydrated
function waitForDocusaurusHydration() {
  return document.documentElement.dataset.hasHydrated === 'true';
}

test.describe.configure({ mode: 'parallel' });

let pathnames: string[] = [];

test.beforeAll(async () => {
  // Fetch the sitemap dynamically
  try {
    const response = await axios.get(sitemapUrl);
    const sitemapContent = response.data;
    pathnames = extractSitemapPathnames(sitemapContent).filter((pathname) =>
      pathname.startsWith('/docs/en') // currently test en only
    );
    console.log(`${pathnames.length} paths to test`);
  } catch (error) {
    console.error(`Failed to fetch sitemap: ${error.message}`);
    throw error;
  }
});


for (const pathname of pathnames) {
  console.log(`Processing ${pathname}`);
  test('Generate and run screenshot tests', async ({ page }) => {
    const url = siteUrl + pathname;
    const timeout = 60000; // 60 seconds timeout for navigation
    try {
      await page.goto(url, { timeout });
      console.log(`Successfully loaded ${url}`);
  
      // Wait for hydration with a timeout
      await page.waitForFunction(waitForDocusaurusHydration, { timeout });
      console.log(`Hydration completed for ${url}`);
  
      // Add custom stylesheet for screenshots
      await page.addStyleTag({ content: stylesheet });
  
      // Take a screenshot
      await argosScreenshot(page, pathnameToArgosName(pathname));
      console.log(`Screenshot captured for ${pathname}`);
    } catch (error) {
      console.error(`Failed to process ${pathname}: ${error.message}`);
    }
  });
}


