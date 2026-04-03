import styles from './styles.module.css';
import React, {Suspense} from 'react'
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

const SettingsInfoBlock = ({type, default_value, changeable_without_restart}) => {
    const headers = [
        { label: 'Type' },
        { label: 'Default value' },
    ];
    const items = [
        { label: `${type}` },
        { label: `${default_value}` },
    ];

    if (changeable_without_restart) {
        headers.push({ label: 'Changeable without restart' });
        items.push({ label: `${changeable_without_restart}` });
    }

    return(
        <BrowserOnly fallback={<SettingsInfoBlockPlaceholder />}>
            {() => {
                return <div
                    className={styles.settingsInfoBlock}
                >
                    <Suspense fallback={<SettingsInfoBlockPlaceholder />}>
                        <Table
                            headers={headers}
                            rows={
                                [
                                    {
                                        id: "row-1",
                                        items: items
                                    }
                                ]
                            }
                            size="sm"
                            className={styles.table}
                        >
                        </Table>
                    </Suspense>
                </div>
            }}
        </BrowserOnly>
    )
}

export default SettingsInfoBlock
