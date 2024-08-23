import React from "react"
import styles from "./styles.module.css"

const Icon = () => {
    return (
        <div className={styles.cloudNotSupportedIcon} style={{marginRight: '8px', marginTop: '4px'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path stroke-width="1.5" d="M6.33366 12.6666L12.3739 12.6667C13.6593 12.6667 14.7073 11.6187 14.7073 10.3334C14.7073 9.04804 13.6593 8.00003 12.3739 8.00003C12.3739 8.00003 12.3337 7.66659 12.0003 7.33325M10.667 5.33322C8.00033 2.33325 4.45395 4.78537 4.14195 6.68203C2.55728 6.7627 1.29395 8.06203 1.29395 9.6667C1.29395 11.3234 2.66699 12.6666 4.00033 12.6666" stroke="#660099" stroke-linecap="round" stroke-linejoin="round"/>
            <path stroke-width="1.5" d="M2.66699 14L12.0003 4.66663" stroke="#660099" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

        </div>
    )
}

const CloudNotSupportedBadge = () => {
    return (
        <div classes className={styles.cloudNotSupportedBadge}>
            <Icon />Not supported in ClickHouse Cloud
        </div>
    )
}

export default CloudNotSupportedBadge
