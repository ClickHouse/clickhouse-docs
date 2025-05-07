import { useEffect, useState } from 'react'
import { useAlgoliaThemeConfig } from "@docusaurus/theme-search-algolia/client";
import { algoliasearch } from "algoliasearch";
import styles from './styles.module.scss'
import {Link} from "react-router-dom";

const RelatedBlogItem = (props) => {
    return (
        <a
            href={`https://clickhouse.com/${props.url}`}
            className={styles.relatedBlogCard}
        >
            <img src={props.image}></img>
            <div className={styles.cardBottom}>
                <h3>{props.headline}</h3>
            </div>
        </a>
    )
}
const RelatedBlogs = (props) => {
    // Setup for Algolia
    const {algolia} = useAlgoliaThemeConfig()
    const client = algoliasearch(algolia.appId, algolia.apiKey);
    const indexName = "clickhouse_blogs_articles";

    // Access frontmatter of the doc
    const keywords = props.frontMatter.keywords || []

    // State
    const [relatedBlogs, setRelatedBlogs] = useState([]);

    useEffect(()=>{
        const fetchRelatedBlogs = async (client, index_name, title, keywords) => {

            let search_query = ''
            if (keywords.length === 0)
                search_query = title
            else
                search_query = keywords.join(",")
            console.log(search_query)
            const param_string = `attributesToRetrieve=headline,image,description,url&hitsPerPage=3&optionalWords=${keywords.join(",")}`

            const { results } = await client.search({
                requests: [
                    {
                        query: search_query,
                        indexName: index_name,
                        params: param_string
                    },
                ],
            });
            setRelatedBlogs(results[0].hits)
        }
        let title = props.frontMatter.title || ''
        let keywords = props.frontMatter.keywords || []

        fetchRelatedBlogs(client, indexName, title, keywords).catch(console.error);

    }, [])

    useEffect(()=>{
        console.log(relatedBlogs)
    }, [relatedBlogs])

    return (
        relatedBlogs.length > 0 ? (
            <div className={styles.relatedBlogsContainer}>
                <h2>Related blog posts</h2>
                <div className={styles.blogCardsContainer}>
                    {relatedBlogs.map((blog) => {
                        return <RelatedBlogItem
                            key={blog.url} // Added a key prop which is required in lists
                            url={blog.url}
                            headline={blog.headline}
                            description={blog.description}
                            image={blog.image}
                        />
                    })}
                </div>
            </div>
        ) : (
            <></> // Empty fragment
        )
    );
}

export default RelatedBlogs;