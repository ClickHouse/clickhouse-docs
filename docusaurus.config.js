const URL = process.env.DOSSIER_URL || 'https://path.to.prod.url';
const BASE_URL = process.env.DOSSIER_BASE_URL || '/';

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ClickHouse',
  tagline: 'ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).',
  url: URL,
  baseUrl: BASE_URL,
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'ignore',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ClickHouse', // Usually your GitHub org/user name.
  projectName: 'clickhouse-docs', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      docs: {                                                                      
        sidebar:{                                                                  
          autoCollapseCategories: true,                                            
        }                                                                          
      },
      navbar: {
        title: 'ClickHouse',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'dropdown',
            label: 'Product',
            position: 'left',
            items: [
              {
                label: 'ClickHouse Cloud',
                to: 'https://clickhouse.com/cloud'
              },
              {
                label: 'ClickHouse Open Source',
                to: 'https://clickhouse.com/clickhouse'
              },
            ]
          },
          {
            to: 'docs/home',
            position: 'left',
            label: 'Docs',
          },
          {
            position: 'left',
            label: 'Use Cases',
            to: 'https://clickhouse.com/customer-stories'
          },
          {
            type: 'dropdown',
            label: 'Company',
            position: 'left',
            items: [
              {
                label: 'Blog',
                to: 'https://clickhouse.com/blog'
              },
              {
                label: 'Our story',
                to: 'https://clickhouse.com/company/our-story'
              },
              {
                label: 'Careers',
                to: 'https://clickhouse.com/company/careers'
              },
              {
                label: 'Contact us',
                to: 'https://clickhouse.com/company/contact'
              },
              {
                label: 'News and events',
                to: 'https://clickhouse.com/company/news-events'
              },
            ]
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
                label: 'Meetup',
                href: 'https://www.meetup.com/pro/clickhouse/',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/c/ClickHouseDB',              },
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
          src: 'img/logo_without_text.svg',
        },
        copyright: `Copyright &copy; 2016&ndash;${new Date().getFullYear()} ClickHouse, Inc. ClickHouse Docs provided under the Creative Commons CC BY-NC-SA 4.0 license. ClickHouse&reg; is a registered trademark of ClickHouse, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
