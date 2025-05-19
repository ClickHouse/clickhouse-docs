import { useEffect, useState, useRef } from 'react'
import { useAlgoliaThemeConfig } from "@docusaurus/theme-search-algolia/client";
import { algoliasearch } from "algoliasearch";
import styles from './styles.module.scss'

const RelatedBlogItem = (props) => {

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Date is stored as unix timestamp on Algolia, utility function to make it pretty again
    const date = new Date(props.date * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <a
            href={`${props.url}`}
            className={styles.relatedBlogCard}
        >
            <div className={styles.imageWrapper}>
                {!imageLoaded && !imageError && (
                    <div className={styles.imagePlaceholder}></div>
                )}
                <img
                    src={props.image}
                    loading="lazy"
                    alt={props.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={imageLoaded ? styles.imageLoaded : styles.imageHidden}
                />
            </div>
            <div className={styles.cardBottom}>
                <h3>{props.title}</h3>
                <h6>{date}</h6>
            </div>
        </a>
    )
}

// Loading skeleton components for blog cards
const RelatedBlogSkeleton = () => {
    return (
        <div className={`${styles.relatedBlogCard} ${styles.cardSkeleton}`}>
            <div className={styles.imageSkeletonWrapper}>
                <div className={`${styles.imageSkeleton} ${styles.skeletonPulse}`}></div>
            </div>
            <div className={styles.cardBottom}>
                <div className={`${styles.titleSkeleton} ${styles.skeletonPulse}`}></div>
                <div className={`${styles.dateSkeleton} ${styles.skeletonPulse}`}></div>
            </div>
        </div>
    );
};
const RelatedBlogs = (props) => {

    // Setup for Algolia
    const {algolia} = useAlgoliaThemeConfig()
    const client = algoliasearch(algolia.appId, algolia.apiKey);
    const indexName = "clickhouse_blogs_articles";

    // Access frontmatter of the doc
    const keywords = props.frontMatter.keywords || []
    const title = props.frontMatter.title || '';

    // State
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const containerRef = useRef();

    // Set intersection observer for lazy loading
    useEffect(()=>{
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {threshold: 0.1} // Trigger when 10% of the element is in view
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        };

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };

    }, [])

    function formatKeywords(keywords) {
        if (!Array.isArray(keywords) || keywords.length === 0) {
            return '';
        }

        // Map each keyword to be wrapped in double quotes, then join with comma and space
        return keywords.map(keyword => `"${keyword}"`).join(', ');
    }

    // Results are fetched from Algolia here
    useEffect(() => {
        if (isVisible && !dataFetched) {
            const fetchRelatedBlogs = async () => {
                try {
                    setIsLoading(true);

                    // Calculate timestamp from 18 months ago
                    const cutOff = new Date('2023-01-01');
                    const timestampCutoff = Math.floor(cutOff.getTime() / 1000);

                    // Search on title if there are no keywords
                    let search_query = keywords.length === 0 ? title : formatKeywords(keywords);
                    console.log(formatKeywords(keywords))

                    const param_string = `attributesToRetrieve=title,image,url,date&hitsPerPage=3&optionalWords=${formatKeywords(keywords)}&filters=(category:Engineering)&filters=release_post:false&numericFilters=date>=${timestampCutoff}`;

                    const { results } = await client.search({
                        requests: [
                            {
                                query: search_query,
                                indexName: indexName,
                                params: param_string
                            },
                        ],
                    });

                    setRelatedBlogs(results[0].hits);
                    setDataFetched(true);
                } catch (error) {
                    console.error("Error fetching related blogs:", error);
                    setRelatedBlogs([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRelatedBlogs();
        }
    }, [isVisible, dataFetched, client, indexName, title, keywords]);

    // Debugging: see returned blog objects
    useEffect(()=>{
        console.log(relatedBlogs)
    }, [relatedBlogs])

    // Don't render anything if not visible yet
    if (!isVisible) {
        return <div ref={containerRef} className={styles.relatedBlogsPlaceholder}></div>;
    }

    // Show loading skeletons while fetching data
    if (isLoading) {
        return (
            <div ref={containerRef} className={styles.relatedBlogsContainer}>
                <h2>Related blog posts</h2>
                <div className={styles.blogCardsContainer}>
                    {[1, 2, 3].map((placeholder) => (
                        <RelatedBlogSkeleton key={placeholder} />
                    ))}
                </div>
            </div>
        );
    }

    // Don't render if no related blogs are found
    if (relatedBlogs.length === 0) {
        return <></>;
    }

    // Render actual content when loaded
    return (
        <div className={styles.relatedBlogsContainer}>
            <h2>Related blog posts</h2>
            <div className={styles.blogCardsContainer}>
                {relatedBlogs.map((blog) => {
                    return <RelatedBlogItem
                        date={blog.date}
                        key={blog.url}
                        url={blog.url}
                        title={blog.title}
                        description={blog.description}
                        image={blog.image}
                    />
                })}
            </div>
        </div>
    );
}

export default RelatedBlogs;
