import React from "react"
import styles from "./styles.module.css"

const ScalePlanFeatureBadge = ({feature='This feature', linking_verb_are = false}) => {
    return (
        <div className={styles.scalePlanFeatureContainer}>
            <div className={styles.scalePlanFeatureBadge}>
                Scale plan feature
            </div>
            <div>
                <p>{feature} {linking_verb_are ? 'are' : 'is'} available in the Scale and Enterprise plans. To upgrade, visit the plans page in the cloud console.</p>
            </div>
        </div>
    )
}

export default ScalePlanFeatureBadge
