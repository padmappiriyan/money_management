import { transactionEventBus, TRANSACTION_EVENTS } from '../events/transactionEvents.js';

/**
 * Transaction Event Publisher
 *
 * Thin publish-layer that decouples the command side (controllers) from
 * the event consumers (workers, analytics handlers, etc.).
 *
 * Using Node.js's native EventEmitter keeps this process-local and
 * dependency-free while maintaining the correct CQRS boundary.
 * If the system ever grows to require multiple Node.js processes or
 * microservices, this file is the only place that needs to change
 * (swap EventEmitter calls for Redis Pub/Sub, RabbitMQ, etc.).
 */

/**
 * Publish a TRANSACTION_CREATED domain event.
 *
 * @param {Object} transaction - The Mongoose document or plain object for the new transaction.
 *   Must contain: _id, staffId, staffRole (optional), type, currency, amount, totalPayout, createdAt
 */
export const publishTransactionCreated = (transaction) => {
    // EventEmitter.emit is synchronous but our listener is async;
    // errors inside the listener are caught internally — this call never throws.
    transactionEventBus.emit(TRANSACTION_EVENTS.CREATED, transaction);
    console.log(`[Publisher] Emitted '${TRANSACTION_EVENTS.CREATED}' for TX: ${transaction._id}`);
};

/**
 * Publish a TRANSACTION_UPDATED domain event.
 *
 * @param {Object} eventData - Contains: transaction, oldAmount, oldFees, oldTotalPayout, oldType
 */
export const publishTransactionUpdated = (eventData) => {
    transactionEventBus.emit(TRANSACTION_EVENTS.UPDATED, eventData);
    console.log(`[Publisher] Emitted '${TRANSACTION_EVENTS.UPDATED}' for TX: ${eventData.transaction._id}`);
};
