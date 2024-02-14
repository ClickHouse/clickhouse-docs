import React from "react";
import styles from "./styles.module.css";

const results = [
    {
        title: 'JSON',
        description: 'Stores JavaScript Object Notation (JSON) documents in a single column.',
        location: 'SQL Reference > Data Types'
    },
    {
        title: 'Working with JSON in ClickHouse',
        description: 'A guide to the different methods of using JSON in ClickHouse.',
        location: 'Guide'
    },
    {
        title: 'Variant',
        description: 'A semi-structured data type that stores a value of any other type.',
        location: 'SQL Reference > Data Types'
    },
    {
        title: 'JSON Functions',
        description: 'Functions to working with JSON in ClickHouse.',
        location: 'SQL Reference > Functions'
    }
]

const SearchIcon = () => {
    return (
        <div className={styles.searchIcon}>
            &#9906;
        </div>
    )
}

const SearchBarNew = () => {
    return <div className={styles.searchResultsOverlay}>
        <div className={styles.searchResultsContainer}>
            <SearchBarInput />
            <div style={{
                paddingTop: '10px',
                paddingLeft: '15px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#7F8497',

            }}>Results</div>
            <div>
                {
                    results.map((result, index) => {
                        return (
                            <SearchResult
                                key={index}
                                title={result.title}
                                description={result.description}
                                location={result.location} />
                        )
                    })  
                }
            </div>
        </div>
    </div>
}

const SearchBarInput = () => {
    return (
        <div className={styles.searchInputContainer}>
            <SearchIcon />
            <input type='text' className={styles.searchBarInput} value='json' />
        </div>
    )
}

const SearchResult = ({ title, description, location }) => {
    return (
        <div className={styles.searchResult}>
            <div style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#FDFF73',
                marginBottom: '4px'
            }}>{title}</div>
            <div style={{
                fontSize: '14px',
                marginBottom: '4px'
            }}>{description}</div>
            <div
                 style={{
                    fontSize: '14px',
                    color: '#7F8497'
                }}
            ><em>{location}</em></div>
        </div>
    )
}

export default SearchBarNew;