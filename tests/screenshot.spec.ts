import * as fs from 'fs';
import {argosScreenshot} from '@argos-ci/playwright';
import {test} from '@playwright/test';
import axios from 'axios';
import {extractSitemapPathnames, pathnameToArgosName} from './utils';

// Constants
const siteUrl = process.env.CI ? process.env.BASE_URL : 'http://localhost:3000';
const sitemapUrl = `${siteUrl}/docs/sitemap.xml`;
const stylesheetPath = './tests/screenshot.css';
const stylesheet = fs.readFileSync(stylesheetPath).toString();

// Wait for hydration, requires Docusaurus v2.4.3+
// Docusaurus adds a <html data-has-hydrated="true"> once hydrated
// See https://github.com/facebook/docusaurus/pull/9256
function waitForDocusaurusHydration() {
  return document.documentElement.dataset.hasHydrated === 'true';
}

test.describe('Docusaurus site screenshots', async () => {
  let pathnames: string[] = [];

  test.beforeAll(async () => {
    // Fetch the sitemap dynamically
    const response = await axios.get(sitemapUrl);
    const sitemapContent = response.data;
    pathnames = extractSitemapPathnames(sitemapContent).filter((pathname) =>
      pathname.startsWith('/docs/en') // currently test en only
    );
  });

  test('Generate and run screenshot tests', async ({page}) => {
    // Iterate through the pathnames and run tests dynamically
    for (const pathname of pathnames) {
      console.log(`processing ${pathname}`)
      const url = siteUrl + pathname;
      await page.goto(url);
      await page.waitForFunction(waitForDocusaurusHydration);
      await page.addStyleTag({content: stylesheet});
      await argosScreenshot(page, pathnameToArgosName(pathname));
    }
  });
});
