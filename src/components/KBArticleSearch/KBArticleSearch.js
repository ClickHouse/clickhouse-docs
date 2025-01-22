import React from 'react';
import styles from './styles.module.css'
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useState, useEffect} from "react";

const search_terms = []
const KBArticleSearch = ({kb_articles, onUpdateResults}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredArticles = searchTerm ? kb_articles.filter((article) =>
        searchTerm && article.title.match(new RegExp(searchTerm, 'i')) // Case-insensitive search
    ) : kb_articles;

    useEffect(() => {
        onUpdateResults(filteredArticles); // Call callback with filtered articles
    }, [filteredArticles, onUpdateResults]); // Update on filter changes

    return (
        <form autoComplete="off" className="DocSearch-Button">
            <span className="DocSearch-Button-Container">
                <svg width="20" height="20" className="DocSearch-Search-Icon" viewBox="0 0 20 20" aria-hidden="true"><path
                    d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                    stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round"
                    stroke-linejoin="round"></path></svg>
            </span>
            <input
                type="text"
                onKeyUp={handleSearch}
                placeholder="Search Knowledge Base"
                className={styles.KBArticleInputSearchArea}
            />
        </form>
    )
}

export default KBArticleSearch;