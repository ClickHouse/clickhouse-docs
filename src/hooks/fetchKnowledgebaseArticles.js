import { useState, useEffect } from 'react';

export const useFetchKnowledgebaseArticles = (filepath) => {

    const [articlesWithTags, setArticles] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(filepath);
                const jsonData = await response.json();
                setArticles(jsonData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchArticles();
    }, [filepath]) // re-fetch the articles only if the URL changes (intended to be used once)

    return {articlesWithTags, isLoading, error}
}

export default useFetchKnowledgebaseArticles;