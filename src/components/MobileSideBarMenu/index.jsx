import React, {useState, useEffect} from 'react';
import Hamburger from "./Hamburger";
import MobileSideBarMenuContents from './Content';
import styles from './styles.module.scss';

const MobileSideBarMenu = ({sidebar, menu}) => {
    const [currentMenuState, setMenuState] = useState(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (currentMenuState) {
            // Store original overflow style
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;

            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';

            // Cleanup function
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.width = '';
                document.body.style.height = '';
            };
        }
    }, [currentMenuState]);

    // Function to handle menu close
    const handleMenuClose = () => {
        setMenuState(false);
    };

    const handleItemClick = (item) => {
        // Safely check if item exists and is not collapsible
        if (item && !item.collapsible) {
            handleMenuClose();
        }
    };

    return(
        <>
            <Hamburger
                onClick={() => setMenuState(!currentMenuState)}
            />
            <div className={currentMenuState ? styles.docsMobileMenuBackdropActive : styles.docsMobileMenuBackdropInactive}/>
            <MobileSideBarMenuContents
                onClick={(item) => {
                    if (!item.collapsible) {
                        setMenuState(!currentMenuState)
                    }
                }}
                onClose={handleMenuClose}
                sidebar={sidebar} // Left sidebar items
                menu={menu} // Top level menu items
                isVisible={currentMenuState} // Pass menu visibility state
                className={currentMenuState
                    ? styles.docsMobileMenuActive
                    : styles.docsMobileMenuHidden}
            />
        </>
    );

}

export default MobileSideBarMenu;