import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'
import HomeBreadcrumbItem from "@theme/DocBreadcrumbs/Items/Home";

function capitalizeFirstLetter(str) {

    if (str === 'knowledgebase')
        return 'Knowledge Base'
    if (str.length === 0) {
        return str; // Handle empty string case
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function pretty(str) {

    if (str === 'knowledgebase')
        return 'Knowledge Base'

    let spacedStr = str.replace(/[-_]/g, ' ');
    let words = spacedStr.split(' ');

    let capitalizedWords = words.map(word => {
        // Handle already capitalized words e.g. TTL
        if (word === word.toUpperCase()) {
            return word; // Leave as is
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // convert other letters to lowercase
        }
    });

    return capitalizedWords.join(' ');
}


const BlogBreadcrumbs = () => {

    const location = useLocation();
    const location_paths = location.pathname.split("/")
    let cleaned_location_paths = location_paths.filter((path)=>{
        return !(path === '' || path === 'docs');
    })
    let accumulatedPath = '/docs/';

    if (location.pathname.includes('/page/')) {
        return(<div className={styles.BlogBreadcrumbsContainer}></div>);
    } else {
        return(
        <div className={styles.BlogBreadcrumbsContainer}>
            <HomeBreadcrumbItem/>
            <div className={styles.BlogBreadcrumbs}>
                {
                    cleaned_location_paths.map((path, index) => {
                        accumulatedPath += path;
                        const toPath = accumulatedPath;

                        if (index < cleaned_location_paths.length - 1) { // Check if it's not the last element
                            accumulatedPath += '/'; // Add a slash if it's not the last element
                            return (
                                <div key={`breadcrumb-${path}-${index}`} className={styles.breadCrumbLinkItem}>
                                    <Link className={styles.BreadcrumbLink} key={path} to={toPath}>
                                        {capitalizeFirstLetter(path)}
                                    </Link>
                                    <span className={styles.forwardSlash}>{"/"}</span>
                                </div>
                            );
                        } else { // Last element
                            return (
                                <Link className={styles.BreadcrumbLinkBold} key={`breadcrumb-last-${path}`} to={toPath}>
                                    {pretty(path)}
                                </Link>
                            );
                        }
                    })
                }
            </div>
        </div>
        )
    }
}

export default BlogBreadcrumbs
