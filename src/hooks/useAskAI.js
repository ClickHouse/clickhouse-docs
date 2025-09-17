import { useState, useEffect } from 'react';

// Custom hook to detect Kapa Ask AI widget state
function useAskAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState(null);
    const [isKapaLoaded, setIsKapaLoaded] = useState(false);

    useEffect(() => {
        const checkKapaAvailability = () => {
            if (typeof window !== 'undefined' && window.Kapa) {
                setIsKapaLoaded(true);
                return true;
            }
            return false;
        };

        const setupKapaListeners = () => {
            if (!checkKapaAvailability()) {
                // Retry checking for Kapa after a short delay
                const retryInterval = setInterval(() => {
                    if (checkKapaAvailability()) {
                        clearInterval(retryInterval);
                        setupKapaListeners();
                    }
                }, 500);
                // Clear retry after 10 seconds to avoid infinite checking
                setTimeout(() => clearInterval(retryInterval), 10000);
                return;
            }

            const handleModalOpen = ({ mode }) => {
                setIsOpen(true);
                setCurrentMode(mode);
            };

            const handleModalClose = ({ mode }) => {
                setIsOpen(false);
                setCurrentMode(null);
            };

            window.Kapa("onModalOpen", handleModalOpen, "add");
            window.Kapa("onModalClose", handleModalClose, "add");

            return () => {
                window.Kapa("onModalOpen", handleModalOpen, "remove");
                window.Kapa("onModalClose", handleModalClose, "remove");
            };
        };

        const cleanup = setupKapaListeners();
        return cleanup;
    }, []);

    // Block Algolia search when Kapa is open
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isOpen && event.key === '/') {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown, true);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    const openKapa = (mode = 'ask') => {
        if (window.Kapa) {
            window.Kapa("open", { mode });
        }
    };

    const closeKapa = () => {
        if (window.Kapa) {
            window.Kapa("close");
        }
    };

    return {
        isAskAIOpen: isOpen,
        currentMode,
        isKapaLoaded,
        openKapa,
        closeKapa,
    };
}

export { useAskAI };
export default useAskAI;