import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './models/user.model.js';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            // Token can be passed in auth or headers
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
            
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected via socket: ${socket.user.email} (Role: ${socket.user.role})`);

        // Join role-based room
        socket.join(`${socket.user.role}_room`);
        
        // Also join a personal room for direct notifications
        socket.join(socket.user._id.toString());

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
