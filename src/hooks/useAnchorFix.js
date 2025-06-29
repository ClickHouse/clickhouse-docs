import { useEffect } from 'react';

// We use some components only on the client side, but because Docusaurus is a
// static site generator, there is a weird bug where if you click on a link to
// an anchor, the page will load at the correct location and then jump to the wrong
// place after a few moments as the client side components load in and shift the
// page layout. This is a hack to fix this bug.
export function useAnchorFix() {
    useEffect(() => {
        const handleAnchorScroll = () => {
            const hash = window.location.hash;
            if (hash) {
                // Wait for content to load, then scroll
                setTimeout(() => {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 500); // Adjust timing as needed
            }
        };

        // Run on route changes
        handleAnchorScroll();

        // Also run when images/content finish loading
        window.addEventListener('load', handleAnchorScroll);

        return () => {
            window.removeEventListener('load', handleAnchorScroll);
        };
    }, []);
}