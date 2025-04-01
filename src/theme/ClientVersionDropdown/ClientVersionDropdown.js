import React, {useState, useEffect, useRef} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'
import ReactDOM from 'react-dom';

const ClientVersionDropdown = () => {

    const [displayDropdown, setDisplayDropdown] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const buttonRef = useRef(null);
    const onClickHandler = () => {
        setDisplayDropdown(!displayDropdown)
    }

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
            if (buttonRef.current && !buttonRef.current.contains(event.target))
                setDisplayDropdown(false);
        };

        if (displayDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [displayDropdown])

    const items = [
        {
            'version': 'v0.8+',
            'slug': '/integrations/language-clients/java/jdbc'
        },
        {
            'version': 'v0.7.x',
            'slug': '/integrations/language-clients/java/jdbc-v1'
        },
    ]

    // Render dropdown menu in a portal
    const renderDropdown = () => {
        if (!displayDropdown) return null;

        const dropdownStyle = {
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '120px'
        };

        return ReactDOM.createPortal(
            <div style={dropdownStyle}>
                {items.map((item, index) => (
                    <Link
                        key={index}
                        to={item.slug}
                        style={{
                            display: 'block',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
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
                    {items[0]["version"]}
                </div>
                <span className={styles.triangle}></span>
            </div>

            {renderDropdown()}
        </>
    )
}

export default ClientVersionDropdown