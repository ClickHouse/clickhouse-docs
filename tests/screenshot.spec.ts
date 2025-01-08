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
const NUM_WORKERS = parseInt(process.env.NUM_WORKERS || '1', 10);

// Wait for hydration, requires Docusaurus v2.4.3+
// Docusaurus adds a <html data-has-hydrated="true"> once hydrated
function waitForDocusaurusHydration() {
  return document.documentElement.dataset.hasHydrated === 'true';
}

// Iterate over the number of workers
for (let workerIndex = 0; workerIndex < NUM_WORKERS; workerIndex++) {
  test.describe(`Docusaurus site screenshots batch ${workerIndex}`, async () => {
    let pathnames: string[] = [];
    
    test.beforeAll(async () => {
      // Fetch the sitemap dynamically
      try {
        const response = await axios.get(sitemapUrl);
        const sitemapContent = response.data;
        pathnames = extractSitemapPathnames(sitemapContent).filter((pathname) =>
          pathname.startsWith('/docs/en') // currently test en only
        );
      } catch (error) {
        console.error(`Failed to fetch sitemap: ${error.message}`);
        throw error;
      }
    });

    test('Generate and run screenshot tests', async ({ page, browser }) => {
      const timeout = 30000; // 30 seconds timeout for navigation
      const workerPaths = pathnames.filter((_, index) => index % NUM_WORKERS === workerIndex);
      console.log(`${workerPaths.length} paths to test`);

      for (let i = 0; i < workerPaths.length; i++) {
        const pathname = workerPaths[i];
        console.log(`Processing ${pathname}`);
        const url = siteUrl + pathname;

        try {
          // Recreate the browser context every 10 pages to reduce memory usage
          if (i > 0 && i % 10 === 0) {
            console.log(`Restarting browser context after processing ${i} pages.`);
            await page.context().close();
            const newContext = await browser.newContext();
            page = await newContext.newPage();
          }

          await page.goto(url, { timeout });
          console.log(`Successfully loaded ${url}`);

          // Check for meta redirect
          const metaRedirect = await page.$('meta[http-equiv="refresh"]');
          if (metaRedirect) {
            console.warn(`Skipping ${pathname} due to meta redirect.`);
            continue;
          }

          // Wait for hydration with a timeout
          try {
            await page.waitForFunction(waitForDocusaurusHydration, { timeout });
            console.log(`Hydration completed for ${url}`);
          } catch (error) {
            console.warn(`Skipping ${pathname} due to missing hydration.`);
            continue;
          }

          // Add custom stylesheet for screenshots
          await page.addStyleTag({ content: stylesheet });

          // Take a screenshot
          await argosScreenshot(page, pathnameToArgosName(pathname));
          console.log(`Screenshot captured for ${pathname}`);
        } catch (error) {
          console.error(`Failed to process ${pathname}: ${error.message}`);
        }
      }
    });
  });
}
