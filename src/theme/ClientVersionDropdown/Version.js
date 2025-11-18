import React, { useEffect, useRef } from 'react';

/**
 * Version wrapper component for use with ClientVersionDropdown.
 * Collects all heading IDs within this version for TOC filtering.
 * The parent ClientVersionDropdown component handles showing/hiding based on selection.
 */
const Version = ({ children, versionIndex, isVisible, onHeadersCollected }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Collect heading IDs from this version
        const collectHeaders = () => {
            if (containerRef.current && typeof versionIndex !== 'undefined') {
                const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
                const headerIds = [];

                headings.forEach(heading => {
                    if (heading.id) {
                        headerIds.push(heading.id);
                        // Mark heading with version index for reference
                        heading.setAttribute('data-version-index', versionIndex);
                    }
                });

                // Notify parent component of the headers in this version
                if (onHeadersCollected && headerIds.length > 0) {
                    onHeadersCollected(versionIndex, headerIds);
                }
            }
        };

        // Run immediately and after a short delay to catch late-rendered content
        collectHeaders();
        const timer = setTimeout(collectHeaders, 100);

        return () => clearTimeout(timer);
    }, [versionIndex, children, onHeadersCollected]);

    return (
        <div ref={containerRef} data-version-index={versionIndex}>
            {children}
        </div>
    );
};

export default Version;