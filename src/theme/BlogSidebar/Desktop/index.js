import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';
import SearchBar from "../../SearchBar";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
export default function BlogSidebarDesktop({sidebar}) {
    const { siteConfig } = useDocusaurusContext();
    return (
    <aside className="col col--3">
      <div className={styles.sidebarSearchContainer}>
        <SearchBar />
      </div>
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
            <Link to={siteConfig.customFields.blogSidebarLink}>
                {sidebar.title}
            </Link>
        </div>
        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {sidebar.items.map((item) => (
            <li key={item.permalink} className={styles.sidebarItem}>
              <Link
                isNavLink
                to={item.permalink}
                className={styles.sidebarItemLink}
                activeClassName={styles.sidebarItemLinkActive}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
