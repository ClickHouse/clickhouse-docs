import React from 'react';
import styles from './styles.module.css'
import {useState, useEffect} from "react";
import Tags from '@yaireo/tagify/react' // React-wrapper file
import '@yaireo/tagify/dist/tagify.css'

const KBArticleSearch = ({kb_articles, onUpdateResults, allowed_tags, kb_articles_and_tags}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState([]);

    // Settings for Tagify
    const settings = {
        maxTags: 3,
        dropdown: {
            enabled: 0,
            position: "input",
            maxItems: allowed_tags.length,
        },
        whitelist: allowed_tags.sort().map((value, index) => ({
            id: index+1,
            value: value
        }))
    };

    // Helper function to return an array of article tags given the article title
    const articleTagsFromTitle = (title, kb_articles_and_tags) => {
        const match = kb_articles_and_tags.find(article => article.title === title)
        return match ? match.tags : null;
    }

    // Helper function to return matches between a list of objects with tags property and an array of tags
    const filterObjectsByTags = (articles, tags) => {
        return articles.filter(article => {
            if (!article.tags) {
                return false;
            }
            return tags.some(tag => article.tags.includes(tag));
        });

    }
    // Helper function to return a list of articles given some tags
    const articlesTitlesFromTags = (searchTags, kb_articles_and_tags) => {
        const matches = filterObjectsByTags(kb_articles_and_tags, searchTags)
        if (matches.length > 1)
            return matches.map((match)=>match.title);
        return []
    }

    // handler function called on onKeyUp events in the text search bar
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // handler function called on onChange events in the tags bar
    const handleTags = (event) => {
        let tags_raw = []
        let tags_cleaned = []
        if (event.detail.tagify.getCleanValue() !== undefined)
        {
            tags_raw = event.detail.tagify.getCleanValue()
            tags_cleaned = tags_raw.map((tag)=>tag.value)
        }
        setSearchTags(tags_cleaned)
    }

    // Helper function to sort by tags
    const sortByTags = (matching_article_titles, kb_articles) =>
    {
        return kb_articles.filter((article)=> matching_article_titles.includes(article.title));
    }

    // filter articles based on the provided search term and tags
    const filteredArticles = () =>
    {
        const regex = new RegExp(searchTerm, 'i');
        // return all articles if there is no search term, or we aren't filtering by tag
        if (searchTags.length === 0 && searchTerm.length === 0) {
            console.log("Returning KB articles")
            return kb_articles;
        // sort only by tag if we filter by tags but there is no search term
        } else if (searchTags.length >= 1 && searchTerm.length === 0) {
            console.log("Sorting only by tags")
            const matching_article_titles = articlesTitlesFromTags(searchTags, kb_articles_and_tags);
            return sortByTags(matching_article_titles, kb_articles);
        // sort only by searchTerm if there are no tags set
        } else if (searchTags.length === 0 && searchTerm.length >= 1) {
            console.log("Sorting only by search term")
            return kb_articles.filter((article)=>article.title.match(regex))
        // sort by tags first, then by search term
        } else if (searchTags.length >= 1 && searchTerm.length >= 1) {
            console.log("Sorting by both tags and search term")
            const matching_article_titles = articlesTitlesFromTags(searchTags, kb_articles_and_tags);
            const sorted_by_tag = sortByTags(matching_article_titles, kb_articles);
            return sorted_by_tag.filter((article)=>article.title.match(regex))
        }
    };

    useEffect(() => {
        onUpdateResults(filteredArticles); // Call callback with filtered articles
    }, [searchTerm, searchTags]); // Update on filter changes

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
            onAdd={handleTags}
            onRemove={handleTags}
        />
        </div>
)
}

export default KBArticleSearch;