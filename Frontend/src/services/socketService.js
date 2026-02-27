import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

let socket;

export const initiateSocketConnection = () => {
    socket = io(SOCKET_URL);
    console.log(`Connecting socket...`);
};

export const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if (socket) socket.disconnect();
};

export const subscribeToTelemetry = (cb) => {
    if (!socket) return (true);
    socket.on('telemetryUpdate', data => {
        console.log('Telemetry update received!');
        return cb(null, data);
    });
};

export const subscribeToViolations = (cb) => {
    if (!socket) return (true);
    socket.on('newViolation', data => {
        console.log('New violation received!');
        return cb(null, data);
    });
};
