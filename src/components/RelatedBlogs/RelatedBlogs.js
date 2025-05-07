import {useEffect, useState} from 'react'
import {useAlgoliaThemeConfig} from "@docusaurus/theme-search-algolia/client";
import { algoliasearch } from "algoliasearch";
import styles from './styles.module.scss'
import {Link} from "react-router-dom";

const RelatedBlogItem = (props) => {
    return (
        <Link
            to={`https:www.clickhouse.com/${props.url}`}
            className={styles.relatedBlogCard}
        >
            <img src={props.image}></img>
            <div className={styles.cardBottom}>
                <h3>{props.headline}</h3>
            </div>
        </Link>
    )
}
const RelatedBlogs = (props) => {
    // Setup for Algolia
    const {algolia} = useAlgoliaThemeConfig()
    const client = algoliasearch(algolia.appId, algolia.apiKey);
    const indexName = "clickhouse_blog_articles";

    // Access frontmatter of the doc
    const keywords = props.frontMatter.keywords || []

    // State
    const [relatedBlogs, setRelatedBlogs] = useState([]);

    useEffect(()=>{
        const fetchRelatedBlogs = async (client, index_name, query_string) => {
            const { results } = await client.search({
                requests: [
                    {
                        indexName: index_name,
                        query: query_string,
                        params: "attributesToRetrieve=headline,image,description,url&hitsPerPage=3"
                    },
                ],
            });
            setRelatedBlogs(results[0].hits)
        }
        fetchRelatedBlogs(client, indexName, "json").catch(console.error);

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