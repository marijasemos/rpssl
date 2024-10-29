import { useState } from 'react';
import * as signalR from '@microsoft/signalr';

/**
 * Custom hook for managing SignalR connections and events
 * @param {Object} eventHandlers - An object mapping event names to handler functions
 */
const useSignalR = (eventHandlers) => {
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Function to initialize and start the connection
    const startConnection = (hubUrl) => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, { skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets })
            .withAutomaticReconnect([0, 2000, 10000, 30000]) // Reconnect intervals
            .build();

        // Attach event handlers to the new connection
        if (eventHandlers) {
            Object.keys(eventHandlers).forEach(eventName => {
                newConnection.on(eventName, eventHandlers[eventName]);
            });
        }

        // Start the connection manually
        newConnection.start()
            .then(() => {
                console.log('Connected to SignalR hub!');
                setIsConnected(true);
                setConnection(newConnection);
            })
            .catch((err) => {
                console.error('Failed to connect to SignalR hub:', err);
            });

        // Cleanup function to stop the connection and remove event handlers on unmount
        return () => {
            stopConnection();
        };
    };

    // Function to stop the connection manually
    const stopConnection = () => {
        if (connection) {
            connection.stop()
                .then(() => {
                    console.log('SignalR connection stopped.');
                    setIsConnected(false);
                    setConnection(null);
                })
                .catch((err) => {
                    console.error('Failed to stop SignalR connection:', err);
                });

            // Remove event handlers if defined
            if (eventHandlers) {
                Object.keys(eventHandlers).forEach(eventName => {
                    connection.off(eventName, eventHandlers[eventName]);
                });
            }
        }
    };

    return { connection, isConnected, startConnection, stopConnection };
};

export default useSignalR;
