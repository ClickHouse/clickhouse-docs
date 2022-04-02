// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const clickhouseTheme = require('prism-react-renderer/themes/vsLight');
//const clickhouseTheme = import('./src/theme/clickhouseTheme.mjs');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ClickHouse Docs',
  tagline: 'Documentation, quick starts, user guides, technical references, FAQs and more...',
  url: 'https://clickhouse.com/',
  baseUrl: '/',
  onBrokenLinks: 'error',
  onBrokenMarkdownLinks: 'ignore',
  favicon: 'img/favicon.ico',
  organizationName: 'ClickHouse', 
  projectName: 'clickhouse-docs', 
  plugins: [
    'remark-docusaurus-tabs',
    [
      require.resolve('docusaurus-lunr-search'),
      {
        excludeRoutes: [
          'docs/whats-new/changelog/**/*', // exclude changelogs from indexing
      ]
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/docs/en/whats-new/changelog/',
            from: '/docs/en/changelog/',
          }, 
          {
            to: '/docs/en/whats-new/roadmap',
            from: '/docs/en/roadmap',
          },
          {
            to: '/docs/en/whats-new/security-changelog',
            from: '/docs/en/security_changelog',
          },

        ],
        createRedirects(existingPath) {
          if (existingPath.includes('/table-engines')) {
            return [
              existingPath.replace('engines/table-engines', 'engines/table_engines'),
              existingPath.replace('engines/table-engines', 'operations/table_engines'),
            ];
          }
          if (existingPath.includes('/agg-functions')) {
            return [
              existingPath.replace('query-language/agg-functions', 'agg_functions'),
            ];
          }          
          if (existingPath.includes('/data-types')) {
            return [
              existingPath.replace('sql-reference/data-types', 'data_types'),
            ];
          }          
          if (existingPath.includes('/database-engines')) {
            return [
              existingPath.replace('engines/database-engines', 'database_engines'),
            ];
          }          
          if (existingPath.includes('/operations/utilities')) {
            return [
              existingPath.replace('/utilities/', '/utils/'),
            ];
          }     
          if (existingPath.includes('/sql-reference')) {
            return [
              existingPath.replace('/sql-reference', '/query_language'),
            ];
          }
          if (existingPath.includes('/development') || 
              existingPath.includes('/engines' ||
              existingPath.includes('/getting-started')) ||
              existingPath.includes('/operations') ||
              existingPath.includes('/sql-reference') ||
              existingPath.includes('/whats-new') 
            ) {
            return [
              existingPath.replace('-', '_'),
            ];
          }
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ]
  ],

  themes: ['@docusaurus/theme-live-codeblock'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editCurrentVersion: true,
          showLastUpdateTime: false,
          sidebarCollapsed: true,
          exclude: [
            'reference/commercial',
            'reference/faq',
            'reference/getting-started',
            'reference/guides',
            'reference/introduction',
            'reference/whats-new',
            'integrations/kafka/code'
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      disableSwitch: true,
      autoCollapseSidebarCategories: true,
      navbar: {
        title: 'ClickHouse',
        hideOnScroll: true,
        logo: {
          alt: 'ClickHouse',
          src: 'img/clickhouse.svg',
          href: '/docs/'
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'ClickHouse',
            items: [
              {
                label: 'Company',
                to: 'https://clickhouse.com/',
              },
              {
                label: 'ClickHouse as a Service',
                to: 'https://clickhouse.com/cloud/',
              },              
              {
                label: 'Careers',
                to: 'https://clickhouse.com/careers/',
              },
              {
                label: 'Learn ClickHouse',
                to: 'https://clickhouse.com/learn/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ClickHouse/ClickHouse',
              },
              {
                label: 'Blog',
                href: 'https://clickhouse.com/blog/en/',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/c/ClickHouseDB',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ClickHouseDB',
              },
              {
                label: 'Slack',
                href: 'https://join.slack.com/t/clickhousedb/shared_invite/zt-rxm3rdrk-lIUmhLC3V8WTaL0TGxsOmg',
              },
            ],
          },
          {
            title: 'Policies',
            items: [
              {
                label: 'Trademark Policy',
                to: 'https://clickhouse.com/legal/trademark-policy/',
              },
              {
                label: 'Privacy Policy',
                to: 'https://clickhouse.com/legal/privacy-policy/',
              },
              {
                label: 'Cookie Policy',
                to: 'https://clickhouse.com/legal/cookie-policy/',
              },
            ],
          },
        ],
        logo: {
          alt: 'ClickHouse Documentation',
          src: 'img/logo.png'
        },
        copyright: `Copyright © 2016 - ${new Date().getFullYear()} ClickHouse, Inc. ClickHouse Docs provided under the Creative Commons CC BY-NC-SA license. ClickHouse is a registered trademark of ClickHouse, Inc.`,
      },
      prism: {
        theme: clickhouseTheme,
        additionalLanguages: ['java','cpp'],
      },
      colorMode: {
        disableSwitch: true,
      },
/*       announcementBar: {
        id: 'support_us',
        content:
          'Welcome to the newly-updated ClickHouse documentation!',
        backgroundColor: '#11223e',
        textColor: '#ffffff',
        isCloseable: false,
      }, */

    }),
};

module.exports = config;
