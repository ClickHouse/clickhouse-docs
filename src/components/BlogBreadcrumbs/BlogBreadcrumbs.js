import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'

function capitalizeFirstLetter(str) {
    if (str.length === 0) {
        return str; // Handle empty string case
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function pretty(str) {
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

    return(
        <div className={styles.BlogBreadcrumbs}>
            {
                cleaned_location_paths.map((path, index)=>{
                    accumulatedPath += path;
                    const toPath = accumulatedPath;

                    if (index < cleaned_location_paths.length - 1) { // Check if it's not the last element
                        accumulatedPath += '/'; // Add a slash if it's not the last element
                        return (
                            <Link className={styles.BreadcrumbLink} key={path} to={toPath}>
                                {capitalizeFirstLetter(path) + " / "}
                            </Link>
                        );
                    } else { // Last element
                        return (
                            <Link className={styles.BreadcrumbLinkBold} key={path} to={toPath}>
                                {pretty(path)}
                            </Link>
                        );
                    }
                })
            }
        </div>
    )
}

export default BlogBreadcrumbs