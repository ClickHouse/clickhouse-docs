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
            to: '/docs/en/whats-new/changelog/2017',
            from: '/docs/en/changelog/2017',
          }, 
          {
            to: '/docs/en/whats-new/changelog/2018',
            from: '/docs/en/changelog/2018',
          }, 
          {
            to: '/docs/en/whats-new/changelog/2019',
            from: '/docs/en/changelog/2019',
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
          if (existingPath.includes('/en')) {
            return [
              existingPath.replaceAll('-', '_'),
            ];
          } 
          if (existingPath.includes('/en/')) {
            return [
              existingPath.replace('/index.html', '/index/'),
            ];
          } 
          if (existingPath.includes('getting-started/example-datasets')) {
            return [
              existingPath.replace('getting-started/example-datasets', 'getting_started/example_datasets'),
            ];
          }
          if (existingPath.includes('/en/whats-new/changelog')) {
            return [
              existingPath.replace('/en/whats-new/changelog', '/en/changelog'),
            ];
          }
          if (existingPath.includes('/en/whats-new/security-changelog')) {
            return [
              existingPath.replace('/en/whats-new/security_changelog', '/en/security_changelog'),
            ];
          }
          if (existingPath.includes('/engines/table-engines')) {
            return [
              existingPath.replace('/engines/table-engines', '/table_engines'),
            ];
          }
          if (existingPath.includes('/operations/table-engines')) {
            return [
              existingPath.replace('/engines', '/operations'),
            ];
          }
          if (existingPath.includes('/database-engines')) {
            return [
              existingPath.replace('/engines/database-engines', '/database_engines'),
            ];
          }
          if (existingPath.includes('/operations/utilities')) {
            return [
              existingPath.replace('/utilities/', '/utils/'),
            ];
          }     
          if (existingPath.includes('sql-reference')) {
            return [
              existingPath.replace('sql-reference', 'query_language'),
            ];
          }
          if (existingPath.includes('/en/')) 
          {
            return [
              existingPath.replaceAll('/en/', '/ja/'),
              existingPath.replaceAll('/en/', '/ru/'),
              existingPath.replaceAll('/en/', '/zh/'),
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
/*      announcementBar: {
        id: 'support_us',
        content:
          'Check out our new 25-minute video on <a href="https://clickhouse.com/company/events/getting-started-with-clickhouse/" target="_blank"> Getting Started with ClickHouse</a>',
        backgroundColor: '#0057b7',
        textColor: '#ffffff',
        isCloseable: false,
      }, 
*/
    }),
};

module.exports = config;
