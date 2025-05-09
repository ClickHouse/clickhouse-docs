import styles from './styles.module.css';
import React, { Suspense } from 'react'

const Table = React.lazy(() => import('@clickhouse/click-ui/bundled').then(module => ({
    default: module.Table
})));

function SettingsInfoBlockPlaceholder() {
    // Create a placeholder with similar dimensions to the actual table
    return (
        <div className={styles.wrapper}>
            <div className={styles.activity}></div>
        </div>
    );
}

const SettingsInfoBlock = ({type, default_value}) => {
    return(
        <Suspense fallback={<SettingsInfoBlockPlaceholder />}>
        <div
            className={styles.settingsInfoBlock}
        >
            <Table
                headers={[
                    {
                        label: 'Type'
                    },
                    {
                        label: 'Default value'
                    },
                ]}
                rows={
                    [
                        {
                            id: "row-1",
                            items: [
                                {label: `${type}`},
                                {label: `${default_value}`}
                            ]
                        }
                    ]
                }
                size="sm"
                className={styles.table}
            ></Table>
        </div>
        </Suspense>
    )
}

export default SettingsInfoBlock
