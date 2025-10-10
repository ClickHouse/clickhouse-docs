import React from "react"
import styles from "./styles.module.css"

const EnterprisePlanFeatureBadge = ({feature='This feature', support=false, linking_verb_are = false}) => {
    return (
        <div className={styles.enterprisePlanFeatureContainer}>
            <div className={styles.enterprisePlanFeatureBadge}>
                Enterprise plan feature
            </div>
            <div>
                <p>{feature} {linking_verb_are ? 'are' : 'is'} available in the Enterprise plan. {support ? `Contact support to enable this feature.` : 'To upgrade, visit the plans page in the cloud console.'}</p>
            </div>
        </div>
    )
}

export default EnterprisePlanFeatureBadge;
