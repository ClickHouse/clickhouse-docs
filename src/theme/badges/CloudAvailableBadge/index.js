import React from "react"
import styles from "./styles.module.css"

const Icon = () => {
    return (
        <div className={styles.cloudIcon} style={{marginRight: '8px', marginTop: '4px'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.33395 12.6667H12.3739C13.6593 12.6667 14.7073 11.6187 14.7073 10.3334C14.7073 9.04804 13.6593 8.00004 12.3739 8.00004H12.0839V7.33337C12.0839 5.12671 10.2906 3.33337 8.08395 3.33337C6.09928 3.33337 4.45395 4.78537 4.14195 6.68204C2.55728 6.76271 1.29395 8.06204 1.29395 9.66671C1.29395 11.3234 2.63728 12.6667 4.29395 12.6667H5.33395Z"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    )
}

const CloudAvailableBadge = () => {
    return (
        <div classes className={styles.cloudBadge}>
            <Icon />{'Only available in ClickHouse Cloud'}
        </div>
    )
}

export default CloudAvailableBadge
