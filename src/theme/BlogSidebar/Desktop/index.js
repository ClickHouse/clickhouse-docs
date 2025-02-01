import React, { useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';
import SearchBar from "../../SearchBar";
import KBArticleSearch from "../../../components/KBArticleSearch/KBArticleSearch";
import {DocSearchButton} from "@docsearch/react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useCallback, useRef, useState} from "react";
import kb_articles_and_tags from '@site/static/knowledgebase_toc.json';

export default function BlogSidebarDesktop({sidebar}) {

    const { siteConfig } = useDocusaurusContext();

    const storedResults = localStorage.getItem("last_search_results");
    const initialArticles = storedResults ? JSON.parse(storedResults) : kb_articles_and_tags
    const [filteredArticles, setFilteredArticles] = useState(initialArticles);

    const updateResults = (matchingArticlesFromSearch) => {
        setFilteredArticles(matchingArticlesFromSearch);
    }

    useEffect(() => {
        // Check for a stored search term. If it exists, use it to filter.
        const storedTerm = localStorage.getItem('last_search_results');
        if (storedTerm) {
            setFilteredArticles(JSON.parse(storedTerm))
        }
    }, []); // This effect runs only once on mount

    return (
        <aside className="col col--3">
            <div className={styles.sidebarSearchContainer}>
                <SearchBar className={styles.blogsSearch}/>
            </div>
            <div className={clsx(styles.sidebarItemTitle)}>
                <h4 className={styles.KBTitle}>All KB articles</h4>
            </div>
            <div>
                <KBArticleSearch
                    kb_articles={sidebar.items}
                    kb_articles_and_tags={kb_articles_and_tags}
                    onUpdateResults={updateResults}
                    className={styles.KBArticleInput}
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
                    {filteredArticles.map((item) => (
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
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
