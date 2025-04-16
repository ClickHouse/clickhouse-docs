import { Accordion, Table, ClickUIProvider, Container } from '@clickhouse/click-ui/bundled'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './styles.module.css';

const SettingsInfoBlock = ({type, default_value}) => {
    const { colorMode } = useColorMode();
    return(
        <ClickUIProvider theme={colorMode}>
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
        </ClickUIProvider>
    )
}

export default SettingsInfoBlock
