import { Accordion, Table} from '@clickhouse/click-ui/bundled'
import styles from './styles.module.css';

const VersionHistoryDropdown = ({rows=[]}) => {
    return(
            <div
                className={styles.versionHistory}
            >
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
            </div>
    )
}

export default VersionHistoryDropdown
