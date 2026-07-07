import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token } = useAuthContext(); // Assuming AuthContext provides the JWT token

    useEffect(() => {
        if (token) {
            const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: {
                    token
                }
            });

            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                console.log('Connected to socket server');
            });

            return () => {
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
