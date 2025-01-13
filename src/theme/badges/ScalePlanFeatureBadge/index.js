import React from "react"
import styles from "./styles.module.css"

const ScalePlanFeatureBadge = ({feature='This feature'}) => {
    return (
        <div className={styles.scalePlanFeatureContainer}>
            <div className={styles.scalePlanFeatureBadge}>
                Scale plan feature
            </div>
            <div>
                <p>{feature} is only available in the Scale and Enterprise plans. To upgrade, visit the Plans page in the cloud console.</p>
            </div>
        </div>
    )
}

export default ScalePlanFeatureBadge
