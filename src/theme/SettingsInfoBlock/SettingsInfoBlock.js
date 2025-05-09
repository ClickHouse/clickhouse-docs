import styles from './styles.module.css';
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly';

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
        <BrowserOnly fallback={<SettingsInfoBlockPlaceholder />}>
            {() => {
                return <div
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
            }}
        </BrowserOnly>
    )
}

export default SettingsInfoBlock
