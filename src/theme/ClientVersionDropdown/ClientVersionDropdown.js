import React, {useState, useEffect, useRef} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'
import ReactDOM from 'react-dom';
import {useHistory, useLocation} from "react-router-dom";

const ClientVersionDropdown = (props) => {
    const history = useHistory();
    const location = useLocation();
    const [displayDropdown, setDisplayDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Store header IDs for each version
    // Structure: { 0: ['header-1', 'header-2'], 1: ['header-3', 'header-4'] }
    const [versionHeaders, setVersionHeaders] = useState({});

    // Support both old API (snippet) and new API (children)
    const usingChildren = props.children && React.Children.count(props.children) > 0;
    const childrenArray = usingChildren ? React.Children.toArray(props.children) : [];

    // Callback for Version components to report their headers
    const handleHeadersCollected = (versionIndex, headerIds) => {
        setVersionHeaders(prev => ({
            ...prev,
            [versionIndex]: headerIds
        }));
    };

    // Find version from URL parameter on initial load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const versionParam = searchParams.get('v');

        if (versionParam) {
            // Find the matching version in our versions array
            const foundIndex = props.versions.findIndex(item =>
                item.version === versionParam ||
                item.version.replace('.', '') === versionParam ||
                item.version.toLowerCase().replace(/[^a-z0-9]/g, '') === versionParam.toLowerCase()
            );

            if (foundIndex !== -1) {
                setSelectedVersionIndex(foundIndex);
            }
        }
    }, [location.search, props.versions]);

    const onClickHandler = () => {
        setDisplayDropdown(!displayDropdown);
    };

    const handleLinkClick = (e, slug, index) => {
        e.preventDefault();

        setTimeout(() => {
            setDisplayDropdown(false);
            setSelectedVersionIndex(index);

            // Get the version string from the selected version
            const versionString = props.versions[index].version;

            // Determine the URL to navigate to
            let targetUrl;
            if (slug) {
                // If slug provided, navigate to that page
                targetUrl = slug;
            } else {
                // Otherwise update the URL parameter on the current page
                const searchParams = new URLSearchParams(location.search);

                // Convert the version to a URL-friendly format
                const versionParam = versionString.replace(/\./g, '').replace(/\+/g, '');

                searchParams.set('v', versionParam);
                targetUrl = `${location.pathname}?${searchParams.toString()}`;
            }

            history.push(targetUrl);
        }, 10);
    };

    useEffect(() => {
        if (displayDropdown && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: buttonRect.bottom + window.scrollY,
                left: buttonRect.left + window.scrollX
            });
        }
    }, [displayDropdown]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                if (event.target.tagName === 'A') {
                    return;
                }
            }

            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDisplayDropdown(false);
            }
        };

        if (displayDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [displayDropdown]);

    const renderDropdown = () => {
        if (!displayDropdown) return null;

        const dropdownStyleDynamic = {
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
        };

        return ReactDOM.createPortal(
            <div
                className={styles.dropdownStyleStatic}
                style={dropdownStyleDynamic}
                ref={dropdownRef}
            >
                {props.versions.map((item, index) => (
                    <Link
                        key={index}
                        to={item.slug || '#'}
                        style={{
                            display: 'block',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                        onClick={(e) => handleLinkClick(e, item.slug, index)}
                    >
                        {item.version}
                    </Link>
                ))}
            </div>,
            document.body
        );
    };

    const selectedVersion = props.versions[selectedVersionIndex];

    // Effect to filter TOC based on selected version
    useEffect(() => {
        if (!usingChildren) return;

        const filterTOC = () => {
            // Get the header IDs for the currently selected version
            const activeVersionHeaderIds = versionHeaders[selectedVersionIndex] || [];

            if (activeVersionHeaderIds.length === 0) {
                // Headers not collected yet, try again later
                return;
            }

            // Find TOC - try multiple selectors for Docusaurus compatibility
            const tocLinks = document.querySelectorAll(
                '.table-of-contents a, .theme-doc-toc-desktop a, [class*="tocDesktop"] a, .toc a'
            );

            tocLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const headerId = href.substring(1);
                    const linkParent = link.parentElement; // <li> element

                    // Show TOC link only if its header ID is in the active version's headers
                    if (activeVersionHeaderIds.includes(headerId)) {
                        linkParent.style.display = '';
                    } else {
                        linkParent.style.display = 'none';
                    }
                }
            });
        };

        // Run immediately
        filterTOC();

        // Re-run after a delay to catch dynamically rendered TOC items
        const timer = setTimeout(filterTOC, 200);

        return () => clearTimeout(timer);
    }, [selectedVersionIndex, usingChildren, versionHeaders]);

    // Render content based on API being used
    const renderContent = () => {
        if (usingChildren) {
            // New API: render children with show/hide based on selection
            // Clone children and inject version props
            return childrenArray.map((child, index) => {
                const isVisible = index === selectedVersionIndex;

                // Clone the child to add versionIndex and callback props
                const clonedChild = React.cloneElement(child, {
                    versionIndex: index,
                    isVisible: isVisible,
                    onHeadersCollected: handleHeadersCollected
                });

                return (
                    <div
                        key={index}
                        style={{ display: isVisible ? 'block' : 'none' }}
                        data-version-index={index}
                        data-version-visible={isVisible}
                    >
                        {clonedChild}
                    </div>
                );
            });
        } else {
            // Old API: render snippet
            const MDXContent = selectedVersion.snippet;
            return MDXContent && typeof MDXContent === 'function' && <MDXContent />;
        }
    };

    return (
        <>
            <div
                className={styles.dropDownButton}
                onClick={onClickHandler}
                ref={buttonRef}
            >
                <div className={styles.versionText}>
                    {selectedVersion.version}
                </div>
                <span className={styles.triangle}></span>
            </div>

            {renderDropdown()}

            <div className={styles.snippetContainer}>
                {renderContent()}
            </div>
        </>
    );
};

export default ClientVersionDropdown;
