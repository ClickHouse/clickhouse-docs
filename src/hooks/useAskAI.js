import { useState, useEffect } from 'react';

// Custom hook to detect Kapa Ask AI widget state
function useAskAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState(null);
    const [isKapaLoaded, setIsKapaLoaded] = useState(false);

    useEffect(() => {
        // Check if Kapa is available
        const checkKapaAvailability = () => {
            if (typeof window !== 'undefined' && window.Kapa) {
                setIsKapaLoaded(true);
                return true;
            }
        return false;
        };

        // Set up event listeners for Kapa widget
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

            // Define event handlers
            const handleModalOpen = ({ mode }) => {
                setIsOpen(true);
                setCurrentMode(mode);
            };

            const handleModalClose = ({ mode }) => {
                setIsOpen(false);
                setCurrentMode(null);
            };

            // Register event listeners using proper Kapa API
            window.Kapa("onModalOpen", handleModalOpen, "add");
            window.Kapa("onModalClose", handleModalClose, "add");

            // Return cleanup function
            return () => {
                window.Kapa("onModalOpen", handleModalOpen, "remove");
                window.Kapa("onModalClose", handleModalClose, "remove");
            };
        };

        const cleanup = setupKapaListeners();

        // Return cleanup function
        return cleanup;
    }, []); // Remove isOpen dependency since we're not polling anymore

    // Utility functions
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

// Export the hook
export { useAskAI };

// Also export as default for convenience
export default useAskAI;
