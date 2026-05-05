import { io } from "socket.io-client";
import store from "../store";
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted } from "../store/slices/taskSlice";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8800";

let socket = null;

/**
 * Connect to Socket.io server with JWT authentication.
 * Listens for task:created, task:updated, task:deleted events
 * and dispatches Redux actions for instant UI updates.
 */
export const connectSocket = (token) => {
    if (socket && socket.connected) return;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("task:created", (task) => {
        store.dispatch(socketTaskCreated(task));
    });

    socket.on("task:updated", (task) => {
        store.dispatch(socketTaskUpdated(task));
    });

    socket.on("task:deleted", (data) => {
        store.dispatch(socketTaskDeleted(data));
    });

    socket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });
};

/**
 * Disconnect from Socket.io server.
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
