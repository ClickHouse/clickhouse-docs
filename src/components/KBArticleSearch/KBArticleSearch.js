import React from 'react';
import styles from './styles.module.css'
import {useState, useEffect, useRef} from "react";
import FlexSearch from 'flexsearch'
const KBArticleSearch = ({kb_articles, kb_articles_and_tags, onUpdateResults}) => {

    const indexRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState();
    const [matchedArticles, setMatchedArticles] = useState();

    useEffect(() => {

        if (!indexRef.current) {
            // Add id property to kb_articles_and_tags to be used for indexing
            kb_articles_and_tags.forEach((object, index)=> {
                object.id = index;
            })

            // These don't have a permalink so we need to add it first
            const titleToPermalinkMap = new Map(kb_articles.map(item => [item.title, item.permalink]));
            kb_articles_and_tags.forEach((article)=>{
                const permalink = titleToPermalinkMap.get(article.title);
                if (permalink)
                    article.permalink = permalink
            })

            const index = new FlexSearch.Document({
                    tokenize: "forward",
                    cache: 100,
                    document: {
                        id: "id",
                        store: [
                            "title",
                            "description"
                        ],
                        index: ["title", "description"]
                    }
                }
            );
            kb_articles_and_tags.forEach((article)=>{
                index.add({id: article.id, title: article.title});
            })
            indexRef.current = index;

            const storedTerm = localStorage.getItem('last_search_term');
            if(storedTerm) {
                setSearchTerm(storedTerm)
                // Perform initial search with the stored term
                const results = indexRef.current.search(storedTerm);
                console.log(results)
                setSearchResults(results);
                convert_indexes_to_articles(results);
            } else {
                setMatchedArticles(kb_articles_and_tags);
            }
        }
    }, []);


    const handleSearch = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        const results = indexRef.current.search(newSearchTerm);
        setSearchResults(results);
        convert_indexes_to_articles(results); // Filter articles on search
    };

    useEffect(() => {
        localStorage.setItem('last_search_term', searchTerm);
    }, [searchTerm]);

    useEffect(()=>{
        if(matchedArticles)
            localStorage.setItem('last_search_results', JSON.stringify(matchedArticles));
    }, [matchedArticles])

    const convert_indexes_to_articles = (results) => {
        if (!results || results.length === 0) {
            setMatchedArticles(kb_articles_and_tags); // Return all if no results or results are undefined
        } else {
            const indices = results.flatMap(search_field_results => search_field_results.result);
            const unique_indices = [...new Set(indices)];
            const filteredArticles = kb_articles_and_tags.filter((article) => {
                return unique_indices.includes(article.id);
            });
            setMatchedArticles(filteredArticles);
        }
    };

    useEffect(() => {
        onUpdateResults(matchedArticles); // Call callback with filtered articles
    }, [matchedArticles, onUpdateResults]); // Update on filter changes

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
                value={searchTerm}
                type="text"
                onChange={handleSearch}
                placeholder={searchTerm.length > 0 ? "" : "Search Knowledge Base"}
                className={styles.KBArticleInputSearchArea}
            />
        </form>
        </div>
)
}

export default KBArticleSearch;
