import React from 'react';
import styles from './styles.module.css'
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useState, useCallback, useEffect} from "react";
import Tags, {MixedTags} from '@yaireo/tagify/react' // React-wrapper file
import '@yaireo/tagify/dist/tagify.css'
import {tags} from "../../../static/js/docsearch"; // Tagify CSS
import {useBlogPost} from "@docusaurus/theme-common";

const KBArticleSearch = ({kb_articles, onUpdateResults, allowed_tags, kb_articles_and_tags}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState([]);

    // Settings for Tagify
    const settings = {
        maxTags: 3,
        dropdown: {
            enabled: 0,
            position: "input"
        },
        whitelist: allowed_tags.map((value, index) => ({
            id: index+1,
            value: value
        }))
    };

    const articleTagsFromTitle = (title, kb_articles_and_tags) => {
        const match = kb_articles_and_tags.find(article => article.title === title)
        return match ? match.tags : null;
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleTags = (event) => {
        let tags_raw = []
        let tags_cleaned = []
        if (event.detail.value !== '')
        {
            tags_raw = JSON.parse(event.detail.value)
            tags_cleaned = tags_raw.map((tag)=>tag.value)
        }
        setSearchTags(tags_cleaned)
    }

    const filteredArticles = searchTerm ? kb_articles.filter((article) =>
    {
        const tags = articleTagsFromTitle(article.title, kb_articles_and_tags)
        return searchTerm && article.title.match(new RegExp(searchTerm, 'i'))
    } // Case-insensitive search
    ) : kb_articles;

    useEffect(() => {
        onUpdateResults(filteredArticles); // Call callback with filtered articles
    }, [filteredArticles, onUpdateResults]); // Update on filter changes

    return (
        <div>
        <form autoComplete="off" className="DocSearch-Button">
            <span className="DocSearch-Button-Container">
                <svg width="20" height="20" className="DocSearch-Search-Icon" viewBox="0 0 20 20" aria-hidden="true"><path
                    d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                    stroke="currentColor" fill="none" fillRule="evenodd" strokeLinecap="round"
                    strokeLinejoin="round"></path></svg>
            </span>
            <input
                type="text"
                onKeyUp={handleSearch}
                placeholder="Search Knowledge Base"
                className={styles.KBArticleInputSearchArea}
            />
        </form>
        <Tags

            autoFocus={false}
            placeholder='Filter by tags'
            settings={settings}
            onKeydown={handleTags}
        />
        </div>
)
}

export default KBArticleSearch;