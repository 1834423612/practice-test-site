declare global {
    interface Window {
        umami: {
            track: (eventName: string, eventDetails?: Record<string, any>) => void;
        };
    }
}

export { };
