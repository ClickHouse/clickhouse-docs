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
                                {capitalizeFirstLetter(path)}
                            </Link>
                        );
                    }
                })
            }
        </div>
    )
}

export default BlogBreadcrumbs