import { EventEmitter } from 'events';

/**
 * Shared event bus for all User-related domain events.
 * Decouples the command side (controllers) from the task execution side (workers).
 */
export const userEventBus = new EventEmitter();

/**
 * Standard User Management Event Names
 */
export const USER_EVENTS = {
    BULK_UPLOAD_REQUESTED: 'USER_BULK_UPLOAD_REQUESTED',
    BULK_UPLOAD_COMPLETED: 'USER_BULK_UPLOAD_COMPLETED',
};
