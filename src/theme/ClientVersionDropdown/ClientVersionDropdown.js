import React, {useState, useEffect, useRef} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'
import ReactDOM from 'react-dom';
import {useHistory} from "react-router-dom";

const ClientVersionDropdown = (props) => {

    const history = useHistory()
    const [displayDropdown, setDisplayDropdown] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const onClickHandler = () => {
        setDisplayDropdown(!displayDropdown)
    }

    const handleLinkClick = (e, slug) => {
        e.preventDefault();

        // Navigate after a slight delay to ensure the click event completes
        setTimeout(() => {
            setDisplayDropdown(false);
            history.push(slug);
        }, 10);
    };

    // Calculate and update dropdown position when it's displayed
    useEffect(()=> {
        if (displayDropdown && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: buttonRect.bottom + window.scrollY,
                left: buttonRect.left + window.scrollX
            })
        }
    }, [displayDropdown])

    // Close the dropdown menu when clicking outside
    useEffect(()=>{
        const handleClickOutside = (event) => {

            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                if (event.target.tagName === 'A') {
                    return;
                }
            }

            // Otherwise close if clicked outside button or dropdown
            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDisplayDropdown(false);
            }
        };

        if (displayDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [displayDropdown])

    // Render dropdown menu in a portal
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
                        to={item.slug}
                        style={{
                            display: 'block',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                        onClick={(e) => handleLinkClick(e, item.slug)}
                    >
                        {item.version}
                    </Link>
                ))}
            </div>,
            document.body
        );

    }

        return(
        <>
            <div
                className={styles.dropDownButton}
                onClick={onClickHandler}
                ref={buttonRef}
            >
                <div className={styles.versionText}>
                    {props.versions[0]["version"]}
                </div>
                <span className={styles.triangle}></span>
            </div>

            {renderDropdown()}
        </>
    )
}

export default ClientVersionDropdown
