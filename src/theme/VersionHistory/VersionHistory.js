import styles from './styles.module.css';
import React, {Suspense} from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly';

const Table = React.lazy(() => import('@clickhouse/click-ui/bundled').then(module => ({
    default: module.Table
})));

const Accordion = React.lazy(() => import('@clickhouse/click-ui/bundled').then(module => ({
    default: module.Accordion
})));

function VersionHistoryPlaceholder() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.activity}></div>
        </div>
    );
}
const VersionHistoryDropdown = ({ rows = [] }) => {
    return (
        <BrowserOnly fallback={<VersionHistoryPlaceholder />}>
            {() => {
                return (
                    <div className={styles.versionHistory}>
                        <Suspense fallback={<VersionHistoryPlaceholder />}>
                            <Accordion
                                color="default"
                                title="Version history"
                                size="sm"
                                gap="md"
                            >
                                <Table
                                    headers={[
                                        {
                                            label: 'Version'
                                        },
                                        {
                                            label: 'Default value'
                                        },
                                        {
                                            label: 'Comment'
                                        }
                                    ]}
                                    rows={rows}
                                    size="sm"
                                    className={styles.table}
                                ></Table>
                            </Accordion>
                        </Suspense>
                    </div>
                );
            }}
        </BrowserOnly>
    );
};

export default VersionHistoryDropdown
