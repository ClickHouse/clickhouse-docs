import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';
import SearchBar from "../../SearchBar";
import KBArticleSearch from "../../../components/KBArticleSearch/KBArticleSearch";
import {DocSearchButton} from "@docsearch/react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useCallback, useRef, useState} from "react";
import kb_articles_and_tags from '@site/static/kb_toc.json';

const allowed_tags = [
    'Concepts',
    'Migrations',
    'Use Cases',
    'Best Practices',
    'Managing Cloud',
    'Security and Authentication',
    'Cloud Migration',
    'Core Data Concepts',
    'Managing Data',
    'Updating Data',
    'Data Modelling',
    'Deleting Data',
    'Performance and Optimizations',
    'Server Admin',
    'Deployments and Scaling',
    'Settings',
    'Tools and Utilities',
    'System Tables',
    'Functions',
    'Engines',
    'Language Clients',
    'ClickPipes',
    'Native Clients and Interfaces',
    'Data Sources',
    'Data Visualization',
    'Data Formats',
    'Data Ingestion',
    'Data Export',
    'chDB',
    'Errors and Exceptions',
    'Community',
]
export default function BlogSidebarDesktop({sidebar}) {

    const { siteConfig } = useDocusaurusContext();
    const [filteredArticles, setFilteredArticles] = useState(sidebar.items);
    const updateResults = (filteredArticlesFromSearch) => {
        setFilteredArticles(filteredArticlesFromSearch);
    }

    return (
        <aside className="col col--3">
            <div className={styles.sidebarSearchContainer}>
                <SearchBar className={styles.blogsSearch}/>
            </div>
            <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
                <Link to={siteConfig.customFields.blogSidebarLink}>
                    {sidebar.title}
                </Link>
            </div>
            <div>
                <KBArticleSearch
                    kb_articles_and_tags={kb_articles_and_tags}
                    kb_articles={sidebar.items}
                    onUpdateResults={updateResults}
                    className={styles.KBArticleInput}
                    allowed_tags={allowed_tags}
                />
            </div>
            <nav
                className={clsx(styles.sidebar, 'thin-scrollbar')}
                aria-label={translate({
                    id: 'theme.blog.sidebar.navAriaLabel',
                    message: 'Blog recent posts navigation',
                    description: 'The ARIA label for recent posts in the blog sidebar',
                })}>
                <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
                    {filteredArticles ? filteredArticles.map((item) => (
                        <li key={item.title + item.permalink} className={styles.sidebarItem}>
                            <Link
                                key={item.title}
                                isNavLink
                                to={item.permalink}
                                className={styles.sidebarItemLink}
                                activeClassName={styles.sidebarItemLinkActive}>
                                {item.title}
                            </Link>
                        </li>
                    )) : <div/>}
                </ul>
            </nav>
        </aside>
    );
}
