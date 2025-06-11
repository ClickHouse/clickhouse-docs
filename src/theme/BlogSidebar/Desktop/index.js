import React, { useLayoutEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.scss';
import SearchBar from "../../SearchBar";
import KBArticleSearch from "../../../components/KBArticleSearch/KBArticleSearch";
import {DocSearchButton} from "@docsearch/react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useCallback, useRef, useState} from "react";
import kb_articles_and_tags from '@site/static/knowledgebase_toc.json';

export default function BlogSidebarDesktop({sidebar}) {

    const { siteConfig } = useDocusaurusContext();
    const [filteredArticles, setFilteredArticles] = useState();

    useLayoutEffect(() => {
        if(typeof localStorage !== 'undefined') {
            const storedResults = localStorage.getItem('last_search_results');
            if (storedResults && storedResults!== 'undefined') {
                setFilteredArticles(JSON.parse(storedResults));
            }
        }
    },[]);

    const updateResults = (matchingArticlesFromSearch) => {
        setFilteredArticles(matchingArticlesFromSearch);
    }

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
                className={styles.sidebar}
                aria-label={translate({
                    id: 'theme.blog.sidebar.navAriaLabel',
                    message: 'Blog recent posts navigation',
                    description: 'The ARIA label for recent posts in the blog sidebar',
                })}>
                <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
                    {filteredArticles && filteredArticles.map((item) => (
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
