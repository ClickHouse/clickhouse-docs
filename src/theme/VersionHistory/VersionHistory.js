import { Accordion, Table, ClickUIProvider, Container } from '@clickhouse/click-ui/bundled'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './styles.module.css';

const VersionHistoryDropdown = ({rows=[]}) => {
    const { colorMode } = useColorMode();
    return(
        <ClickUIProvider theme={colorMode}>
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
        </ClickUIProvider>
    )
}

export default VersionHistoryDropdown
