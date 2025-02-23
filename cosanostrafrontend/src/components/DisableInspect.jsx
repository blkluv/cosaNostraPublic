import { useEffect } from "react";

const DisableInspect = () => {
    useEffect(() => {
        // Disable Right-Click
        document.addEventListener("contextmenu", (event) => event.preventDefault());

        // Block Certain Keys
        document.addEventListener("keydown", (event) => {
            if (
                event.key === "F12" || 
                (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
                (event.ctrlKey && event.key === "U")
            ) {
                event.preventDefault();
            }
        });

        return () => {
            document.removeEventListener("contextmenu", (event) => event.preventDefault());
            document.removeEventListener("keydown", (event) => event.preventDefault());
        };
    }, []);

    return null; // No UI
};

export default DisableInspect;
