import { transactionEventBus, TRANSACTION_EVENTS } from '../events/transactionEvents.js';
import DailyLedgerRollup from '../models/dailyLedgerRollup.model.js';
import { User } from '../models/user.model.js';
import { CashLedger } from '../models/cashLedger.model.js';
import { Platform } from '../models/platform.model.js';
import UserPlatformBalance from '../models/userPlatformBalance.model.js';

/**
 * Stats Aggregation Worker
 *
 * Listens to the internal TransactionEventBus and updates the DailyLedgerRollup
 * collection using atomic $inc operations for high-concurrency safety.
 *
 * This replaces the previous BullMQ/Redis-based worker with a lightweight,
 * dependency-free Node.js EventEmitter listener — the correct approach when
 * all producers and consumers live in the same Node.js process.
 *
 * Architecture: CQRS Read-Model updater
 *   - Write side: transactionController publishes events
 *   - Read side: this worker updates pre-computed rollup documents
 */

/**
 * Process a TRANSACTION_CREATED event and upsert the daily rollup document.
 * Uses atomic $inc so concurrent events can never cause double-counting.
 *
 * @param {Object} transaction - The newly created Mongoose transaction document
 */
const handleTransactionCreated = async (transaction) => {
    try {
        // Normalize to UTC midnight for the composite rollup key
        const txDate = new Date(transaction.createdAt);
        txDate.setUTCHours(0, 0, 0, 0);

        // Resolve the creator's role — prefer the value already on the document
        // to avoid an extra DB round-trip on every event.
        let creatorRole = transaction.staffRole;
        if (!creatorRole && transaction.staffId) {
            const creator = await User.findById(transaction.staffId).select('role').lean();
            creatorRole = creator?.role ?? 'user';
        }

        // 1. Update DailyLedgerRollup (Aggregated Stats)
        await DailyLedgerRollup.findOneAndUpdate(
            {
                date:     txDate,
                staffId:  transaction.staffId,
                currency: transaction.currency || 'USD',
                type:     transaction.type,
            },
            {
                $setOnInsert: { creatorRole },
                $inc: {
                    originalAmount:   transaction.amount        || 0,
                    totalPayoutLkr:   transaction.totalPayout   || 0,
                    transactionCount: 1,
                },
            },
            {
                upsert:              true,
                new:                 true,
                setDefaultsOnInsert: true,
            }
        );

        // 2. Update CashLedger (Running Physical Drawer Balance)
        // Send (Collection) increases cash (+) | Receive (Payout) decreases cash (-)
        let drawerBalanceChange = 0;
        const txValue = (transaction.totalPayout || transaction.amount);

        if (transaction.type === 'send') {
            drawerBalanceChange = txValue; // Inflow (+)
        } else {
            drawerBalanceChange = -txValue; // Outflow (Paid/Deposit) (-)
        }

        await CashLedger.findOneAndUpdate(
            {
                date:     txDate,
                staffId:  transaction.staffId,
                currency: 'LKR',
            },
            {
                $inc: { 
                    expectedClosing: drawerBalanceChange,
                    totalTransactionNet: drawerBalanceChange 
                }
            },
            {
                upsert:              true,
                setDefaultsOnInsert: true
            }
        );

        // 3. Update Individual Staff Platform Balance (Virtual Vault)
        // Find platform ID from slug
        const platformDoc = await Platform.findOne({ slug: transaction.platform });
        
        if (platformDoc) {
            const amountLkr = transaction.totalPayout || transaction.amount;

            // Business logic for Platform Ledger:
            // • SEND transaction    → customer gives us money → account balance INCREASES (+)
            // • PAID transaction    → we pay out money to customer → account balance DECREASES (-)
            let platformBalanceChange = 0;
            if (transaction.type === 'send') {
                platformBalanceChange = amountLkr;
            } else if (transaction.type === 'receive' || transaction.type === 'deposit') {
                platformBalanceChange = -amountLkr;
            }

            // Prepare atomic increments for daily buckets (breaking down movements)
            const dailyUpdate = {};
            if (transaction.type === 'send') {
                dailyUpdate.todaySendLkr = amountLkr;
            } else if (transaction.type === 'receive') {
                dailyUpdate.todayPaidLkr = amountLkr; 
            } else if (transaction.type === 'deposit') {
                dailyUpdate.todayDepositLkr = amountLkr;
            }

            await UserPlatformBalance.findOneAndUpdate(
                { 
                    userId: transaction.staffId, 
                    platformId: platformDoc._id 
                },
                { 
                    $inc: { 
                        balanceLkr: platformBalanceChange,
                        ...dailyUpdate
                    },
                    $set: { lastUpdated: new Date() }
                },
                { 
                    upsert: true, 
                    setDefaultsOnInsert: true 
                }
            );
        }

        console.log(
            `[Worker] Staff Vault Sync | TX: ${transaction._id} | ` +
            `${transaction.staffId} | ${transaction.platform}`
        );
    } catch (err) {
        // Non-fatal — the transaction itself is already persisted.
        // In a production system you would push this to a dead-letter store / alerting.
        console.error(`[Worker] Rollup failed for TX: ${transaction._id} |`, err.message);
    }
};

const handleTransactionUpdated = async (eventData) => {
    const { transaction, oldAmount, oldFees, oldTotalPayout, oldType } = eventData;
    try {
        const txDate = new Date(transaction.createdAt);
        txDate.setUTCHours(0, 0, 0, 0);

        // 1. Calculate diffs
        const amountDiff = transaction.amount - oldAmount;
        const totalPayoutLkrDiff = transaction.totalPayout - oldTotalPayout;

        // 1. Update DailyLedgerRollup (Aggregated Stats)
        await DailyLedgerRollup.findOneAndUpdate(
            {
                date:     txDate,
                staffId:  transaction.staffId,
                currency: transaction.currency || 'USD',
                type:     transaction.type,
            },
            {
                $inc: {
                    originalAmount:   amountDiff,
                    totalPayoutLkr:   totalPayoutLkrDiff,
                },
            },
            {
                upsert:              true,
                setDefaultsOnInsert: true,
            }
        );

        // 2. Update CashLedger (Running Physical Drawer Balance)
        // Send (Collection) increases cash (+) | Receive (Paid/Deposit) decreases cash (-)
        let drawerBalanceChange = 0;
        if (transaction.type === 'send') {
            drawerBalanceChange = totalPayoutLkrDiff; // Inflow diff
        } else {
            drawerBalanceChange = -totalPayoutLkrDiff; // Outflow diff
        }

        await CashLedger.findOneAndUpdate(
            {
                date:     txDate,
                staffId:  transaction.staffId,
                currency: 'LKR',
            },
            {
                $inc: { 
                    expectedClosing: drawerBalanceChange,
                    totalTransactionNet: drawerBalanceChange 
                }
            },
            {
                upsert:              true,
                setDefaultsOnInsert: true
            }
        );

        // 3. Update Individual Staff Platform Balance (Virtual Vault)
        const platformDoc = await Platform.findOne({ slug: transaction.platform });
        if (platformDoc) {
            let platformBalanceChange = 0;
            if (transaction.type === 'send') {
                platformBalanceChange = totalPayoutLkrDiff;
            } else if (transaction.type === 'receive' || transaction.type === 'deposit') {
                platformBalanceChange = -totalPayoutLkrDiff;
            }

            const dailyUpdate = {};
            if (transaction.type === 'send') {
                dailyUpdate.todaySendLkr = totalPayoutLkrDiff;
            } else if (transaction.type === 'receive') {
                dailyUpdate.todayPaidLkr = totalPayoutLkrDiff; 
            } else if (transaction.type === 'deposit') {
                dailyUpdate.todayDepositLkr = totalPayoutLkrDiff;
            }

            await UserPlatformBalance.findOneAndUpdate(
                { 
                    userId: transaction.staffId, 
                    platformId: platformDoc._id 
                },
                { 
                    $inc: { 
                        balanceLkr: platformBalanceChange,
                        ...dailyUpdate
                    },
                    $set: { lastUpdated: new Date() }
                },
                { 
                    upsert: true, 
                    setDefaultsOnInsert: true 
                }
            );
        }

        console.log(`[Worker] Staff Vault Updated | TX: ${transaction._id}`);
    } catch (err) {
        console.error(`[Worker] Rollup update failed for TX: ${transaction._id} |`, err.message);
    }
};

/**
 * Register all event listeners on the shared event bus.
 * Called once from server.js during application bootstrap.
 */
export const startStatsWorker = () => {
    transactionEventBus.on(TRANSACTION_EVENTS.CREATED, handleTransactionCreated);
    transactionEventBus.on(TRANSACTION_EVENTS.UPDATED, handleTransactionUpdated);

    console.log('[Worker] Stats Aggregation Worker is ACTIVE (EventEmitter mode).');
};
