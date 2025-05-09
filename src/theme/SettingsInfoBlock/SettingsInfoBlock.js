import { Accordion, Table, Container } from '@clickhouse/click-ui/bundled'
import styles from './styles.module.css';

const SettingsInfoBlock = ({type, default_value}) => {
    return(
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
    )
}

export default SettingsInfoBlock
