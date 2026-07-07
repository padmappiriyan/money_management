import { EventEmitter } from 'events';

/**
 * Internal Transaction Event Bus
 *
 * A lightweight, in-process event bus built on Node.js's native EventEmitter.
 * This is the correct architectural pattern when an external message broker (Redis/RabbitMQ)
 * is NOT required — i.e., all consumers live in the same process.
 *
 * Pattern: CQRS Write-side publishes domain events; background handlers on the
 * read-side update pre-computed rollups without blocking the HTTP response.
 */
class TransactionEventBus extends EventEmitter {
    constructor() {
        super();
        // Increase default listener limit to support multiple subscribers per event
        this.setMaxListeners(20);
    }
}

// Singleton instance shared across the entire application
export const transactionEventBus = new TransactionEventBus();

// ── Event Name Constants ───────────────────────────────────────────────────
export const TRANSACTION_EVENTS = {
    CREATED: 'transaction:created',
    UPDATED: 'transaction:updated',
    DELETED: 'transaction:deleted',
};
