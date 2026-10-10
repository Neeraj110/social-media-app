import { io } from "socket.io-client";

// URL of the backend server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});
