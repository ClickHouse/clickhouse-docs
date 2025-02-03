import React from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ScrollableElement from "../../ScrollableElement";
import ColorModeToggle from "../../../components/ColorModeToggler";
import { usePluginData } from "@docusaurus/useGlobalData";
import GlobalMenu from "./GlobalMenu";
import DocsCategoryDropdown, { DocsCategoryDropdownLinkOnly } from "../../../components/DocsCategoryDropdown";
import HamburgerMenu from "../../../components/DocsCategoryMobileNav/HamburgerMenu";
import Navigation from "../../../components/Navigation";
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}

function useNavbarSecondaryItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useDocusaurusContext().siteConfig.customFields.secondaryNavItems ?? [];
}

function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <NavbarItem {...item} key={i} />
      ))}
    </>
  );
}

// TODO: Move this to a config file
// Important note: The link is either the slug (iff one is set) or the file path.
const dropdownCategories = [{
  title: 'Get Started',
  description: 'Learn how to use ClickHouse',
  sidebar: 'docs',
  link: '/docs',
  menuItems: [
    {
      title: 'Introduction',
      description: 'An introduction to ClickHouse',
      link: '/docs/en/intro'
    },
    {
      title: 'Starter Guides',
      description: 'Start here when learning ClickHouse',
      link: '/docs/en/guides/creating-tables'
    },
    {
      title: 'Concepts',
      description: 'Core concepts to know',
      link: '/docs/en/concepts/why-clickhouse-is-so-fast'
    },
    {
      title: 'Migration Guides',
      description: 'Migrate your database to ClickHouse',
      link: '/docs/en/migrations/bigquery'
    },
    {
      title: 'Use Case Guides',
      description: 'Common use case guides for ClickHouse',
      link: '/docs/en/observability'
    },
   
    {
      title: 'Example datasets',
      description: 'Helpful datasets and tutorials',
      link: '/docs/en/getting-started/example-datasets'
    },
  ]
},
  {
    title: 'Cloud',
    description: 'The fastest way to deploy ClickHouse',
    sidebar: 'cloud',
    link: '/docs/en/cloud/overview',
    menuItems: [
      {
        title: 'Get Started',
        description: 'Start quickly with ClickHouse Cloud',
        link: '/docs/en/cloud/get-started/'
      },
      {
        title: 'Managing Cloud',
        description: 'Manage your ClickHouse Cloud services',
        link: '/docs/en/cloud/manage/'
      },
      {
        title: 'Cloud API',
        description: 'Automate your ClickHouse Cloud services',
        link: '/docs/en/cloud/manage/cloud-api/'
      },
      {
        title: 'Cloud Reference',
        description: 'Understanding how ClickHouse Cloud works',
        link: '/docs/en/cloud/reference/'
      },
      {
        title: 'Best Practices',
        description: 'How to get the most out of ClickHouse Cloud',
        link: '/docs/en/cloud/bestpractices/'
      },
      {
        title: 'Security',
        description: 'Secure your ClickHouse Cloud services',
        link: '/docs/en/cloud/security/'
      },
      {
        title: 'Migrating to Cloud',
        description: 'Migrate your database to ClickHouse Cloud',
        link: '/docs/en/integrations/migration'
      },
    ]
  },
  {
    title: 'Manage Data',
    description: 'How to manage data in ClickHouse',
    sidebar: 'managingData',
    link: '/docs/en/updating-data',
    menuItems: [
      {
        title: 'Core Data Concepts',
        description: 'Understand internal concepts in ClickHouse',
        link: '/docs/en/concepts'
      },
      {
        title: 'Updating Data',
        description: 'Updating and replacing data in ClickHouse',
        link: '/docs/en/updating-data'
      },
      {
        title: 'Deleting Data',
        description: 'Deleting data in ClickHouse',
        link: '/docs/en/managing-data/deleting-data/overview'
      },
      {
        title: 'Data Modeling',
        description: 'Optimize your schema and data model',
        link: '/docs/en/data-modeling/overview'
      },
      {
        title: 'Performance and Optimizations',
        description: 'Guides to help you optimize ClickHouse',
        link: '/docs/en/operations/overview'
      }
    ]
  },
  {
    title: 'Server Admin',
    description: 'Manage and deploy ClickHouse',
    sidebar: 'serverAdmin',
    link: '/docs/en/architecture/introduction',
    menuItems: [
      {
        title: 'Deployments and Scaling',
        description: 'How to deploy ClickHouse',
        link: '/docs/en/architecture/introduction'
      },
      {
        title: 'Security and Authentication',
        description: 'Secure your ClickHouse deployment',
        link: '/docs/en/operations/external-authenticators'
      },
      {
        title: 'Settings',
        description: 'Configure ClickHouse',
        link: '/docs/en/operations/settings'
      },
      {
        title: 'Tools and Utilities',
        description: 'Tools to help you manage ClickHouse',
        link: '/docs/en/operations/utilities'
      },
      {
        title: 'System Tables',
        description: 'Metadata tables to help you manage ClickHouse',
        link: '/docs/en/operations/system-tables'
      }
    ]
  },
  {
    title: 'Reference',
    description: 'Reference documentation for ClickHouse features',
    sidebar: 'sqlreference',
    link: '/docs/en/sql-reference',
    menuItems: [
      {
        title: 'Introduction',
        description: 'Learn ClickHouse syntax',
        link: '/docs/en/sql-reference'
      },
      {
        title: 'Functions',
        description: 'Hundreds of built-in functions to help you analyze your data',
        link: '/docs/en/sql-reference/functions'
      },
      {
        title: 'Engines',
        description: 'Use the right table and database engines for your data',
        link: '/docs/en/engines/database-engines'
      },
      {
        title: 'Other Features',
        description: 'Learn about other features in ClickHouse',
        link: '/docs/en/sql-reference/operators'
      }
    ]
  },
  {
    title: 'Integrations',
    description: 'Integrations, clients, and drivers to use with ClickHouse',
    sidebar: 'integrations',
    link: '/docs/en/integrations',
    menuItems: [
      {
        title: 'All Integrations',
        description: 'Integrate ClickHouse with other databases and applications',
        link: '/docs/en/integrations'
      },
      {
        title: 'Language Clients',
        description: 'Use your favorite language to work with ClickHouse',
        link: '/docs/en/integrations/language-clients'
      },
      {
        title: 'ClickPipes',
        description: 'The easiest way to ingest data into ClickHouse',
        link: '/docs/en/integrations/clickpipes'
      },
      {
        title: 'Native Clients & Interfaces',
        description: 'Choose a client and interface to connect to ClickHouse',
        link: '/docs/en/interfaces/natives-clients-and-interfaces'
      },
      {
        title: 'Data Sources',
        description: 'Load data into ClickHouse from your prefered source',
        link: '/docs/en/integrations/index'
      },
      {
        title: 'Data Visualization',
        description: 'Connect ClickHouse to your favorite visualization tool',
        link: '/docs/en/integrations/data-visualization'
      },
      {
        title: 'Data Formats',
        description: 'Explore data formats supported by ClickHouse',
        link: '/docs/en/integrations/data-formats'
      },
      {
        title: 'Data Ingestion',
        description: 'Ingest data into ClickHouse with a range of ELT tools',
        link: '/docs/en/integrations/data-ingestion-overview'
      },
    ]
  },
  {
    title: 'chDB',
    description: 'chDB is an embedded version of ClickHouse',
    sidebar: 'chdb',
    link: '/docs/en/chdb',
    menuItems: [
      {
        title: 'Learn chDB',
        description: 'Learn how to use chDB',
        link: '/docs/en/chdb'
      },
      {
        title: 'Language Integrations',
        description: 'Connect to chDB using a language client',
        link: '/docs/en/chdb/install'
      },
      {
        title: 'Guides',
        description: 'Guides to help you use chDB',
        link: '/docs/en/chdb/guides'
      },
    ]
  },
  {
    title: 'About',
    link: '/docs/en/about-clickhouse',
    sidebar: 'aboutClickHouse',
    description: 'Learn more about ClickHouse',
    menuItems: [
      {
        title: 'Adopters',
        description: 'ClickHouse adopters',
        link: '/docs/en/about-us/adopters'
      },
      {
        title: 'Changelogs',
        description: 'View the latest changes in ClickHouse',
        link: '/docs/en/whats-new/security-changelog'
      },
      {
        title: 'Support',
        description: 'Get support from ClickHouse engineers',
        link: '/docs/en/about-us/support'
      },
      {
        title: 'Development and Contributing',
        description: 'Learn how to contribute to ClickHouse',
        link: '/docs/en/development/developer-instruction'
      }
    ]
  },
]

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const secondaryItems = useNavbarSecondaryItems();
  const [secLeftItems, secRightItems] = splitNavbarItems(secondaryItems);

  const {
    github_stars,
    menuItems,
  } = usePluginData("ch-header-plugin");

  return (
    <div className={`${styles.navbarHeaderContainer} navbar-header`}>
      <div className={clsx('navbar__inner', styles.navbarInner)}>
        <div className={styles.navbarLogo}><NavbarLogo /></div>
        <Navigation className='ch-nav-v2-desktop-item' />
        <div className={styles.navRight}>
          <a
            key="github-stars-nav"
            href="https://github.com/ClickHouse/ClickHouse?utm_source=clickhouse&utm_medium=website&utm_campaign=website-nav"
            target="_blank"
            className={styles.githubStars}
          >
            <div className={styles.githubStarsContainer}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 1.75C4.27062 1.75 1.25 4.77062 1.25 8.5C1.25 11.4869 3.18219 14.0097 5.86531 14.9041C6.20281 14.9631 6.32937 14.7606 6.32937 14.5834C6.32937 14.4231 6.32094 13.8916 6.32094 13.3263C4.625 13.6384 4.18625 12.9128 4.05125 12.5331C3.97531 12.3391 3.64625 11.74 3.35938 11.5797C3.12312 11.4531 2.78562 11.1409 3.35094 11.1325C3.8825 11.1241 4.26219 11.6219 4.38875 11.8244C4.99625 12.8453 5.96656 12.5584 6.35469 12.3813C6.41375 11.9425 6.59094 11.6472 6.785 11.4784C5.28312 11.3097 3.71375 10.7275 3.71375 8.14563C3.71375 7.41156 3.97531 6.80406 4.40563 6.33156C4.33812 6.16281 4.10187 5.47094 4.47312 4.54281C4.47312 4.54281 5.03844 4.36563 6.32937 5.23469C6.86937 5.08281 7.44313 5.00687 8.01688 5.00687C8.59063 5.00687 9.16438 5.08281 9.70438 5.23469C10.9953 4.35719 11.5606 4.54281 11.5606 4.54281C11.9319 5.47094 11.6956 6.16281 11.6281 6.33156C12.0584 6.80406 12.32 7.40312 12.32 8.14563C12.32 10.7359 10.7422 11.3097 9.24031 11.4784C9.485 11.6894 9.69594 12.0944 9.69594 12.7272C9.69594 13.63 9.6875 14.3556 9.6875 14.5834C9.6875 14.7606 9.81406 14.9716 10.1516 14.9041C12.8178 14.0097 14.75 11.4784 14.75 8.5C14.75 4.77062 11.7294 1.75 8 1.75Z"
                  fill="currentColor"
                />
              </svg>

              <span className={styles.githubText}>
                {Intl.NumberFormat("en", {
                  notation: "compact",
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
                  .format(github_stars)
                  .toLowerCase()}
              </span>
            </div>
          </a>
          <a
            href="https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta"
            className={clsx("sign-in navbar__link ch-menu", styles.signIn)}
          >
            Sign in
          </a>
          <a
            href="https://console.clickhouse.cloud/signUp?loc=docs-nav-signUp-cta"
            className="click-button-anchor"
          >
            <button className="click-button primary-btn">Get started</button>
          </a>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        </div>
      </div>
      <div className={clsx("secondary-nav--items", styles.secondaryMenu)}>
        <div className={styles.dropdownCategoriesContainer}>
          {dropdownCategories.map((dropdownCategory, index) => {
            return <DocsCategoryDropdown key={index} dropdownCategory={dropdownCategory} />
          })}
          <DocsCategoryDropdownLinkOnly title='Knowledge Base' link='/docs/knowledgebase' />
        </div>
        <div
          className={`${styles.secondaryMenuRight} secondary-nav--items-right`}
        >
          <NavbarItems items={secRightItems} />
          <ColorModeToggle className="navbar-color-toggle" />
        </div>
        <HamburgerMenu
        />
      </div>
    </div>
  );
}

