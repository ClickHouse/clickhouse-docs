import React, { useRef, useEffect } from 'react';
import styles from './styles.module.scss';

const WideTableWrapper = ({ children }) => {
    const topScrollRef = useRef(null);
    const bottomScrollRef = useRef(null);
    const topScrollContentRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        const topScroll = topScrollRef.current;
        const bottomScroll = bottomScrollRef.current;
        const topScrollContent = topScrollContentRef.current;
        const table = tableRef.current;

        if (!topScroll || !bottomScroll || !topScrollContent || !table) return;

        // Sync scroll positions
        const syncScrollLeft = (source, target) => {
            target.scrollLeft = source.scrollLeft;
        };

        // Update top scroll bar width to match table content width
        const updateTopScrollWidth = () => {
            if (table.scrollWidth && topScrollContent) {
                topScrollContent.style.width = `${table.scrollWidth}px`;
            }
        };

        // Event listeners for scroll synchronization
        const handleTopScroll = () => syncScrollLeft(topScroll, bottomScroll);
        const handleBottomScroll = () => syncScrollLeft(bottomScroll, topScroll);

        topScroll.addEventListener('scroll', handleTopScroll);
        bottomScroll.addEventListener('scroll', handleBottomScroll);

        // Initial width update and observe changes
        updateTopScrollWidth();

        const resizeObserver = new ResizeObserver(updateTopScrollWidth);
        resizeObserver.observe(table);

        // Cleanup
        return () => {
            topScroll.removeEventListener('scroll', handleTopScroll);
            bottomScroll.removeEventListener('scroll', handleBottomScroll);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={styles.wideTableContainer}>
            {/* Top scroll bar */}
            <div
                ref={topScrollRef}
                className={styles.topScrollBar}
            >
                <div
                    ref={topScrollContentRef}
                    className={styles.topScrollContent}
                />
            </div>

            {/* Main content with bottom scroll bar */}
            <div
                ref={bottomScrollRef}
                className={styles.bottomScrollContainer}
            >
                <div ref={tableRef} className={styles.tableContent}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default WideTableWrapper;
