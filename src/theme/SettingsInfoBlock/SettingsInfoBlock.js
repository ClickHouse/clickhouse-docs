import { Table } from '@clickhouse/click-ui/bundled'
import styles from './styles.module.css';
import { useEffect, useRef, useState } from 'react'

const SettingsInfoBlock = ({type, default_value}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const timerRef = useRef(null);

    // Set a timer to remove the shimmer effect after a delay
    useEffect(() => {
        // Set a timer to simulate loading
        timerRef.current = setTimeout(() => {
            setIsLoaded(true);
        }, 200);

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []); // Empty dependency array to run once

    return (
        <div className={styles.settingsInfoBlock}>
            <Table
                headers={[
                    { label: 'Type' },
                    { label: 'Default value' }
                ]}
                rows={[
                    {
                        id: "row-1",
                        items: [
                            {label: `${type}`},
                            {label: `${default_value}`}
                        ]
                    }
                ]}
                size="sm"
                className={styles.table}
            />

            {!isLoaded && (
                <div className={styles.placeholder}>
                </div>
            )}
        </div>
    );
}

export default SettingsInfoBlock