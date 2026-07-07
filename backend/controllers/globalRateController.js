import asyncHandler from 'express-async-handler';
import { GlobalRate } from '../models/globalRate.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';

/**
 * @desc    Get all current global exchange rates
 * @route   GET /api/rates
 * @access  Private-Protected
 */
const getGlobalRates = asyncHandler(async (req, res) => {
    const rates = await GlobalRate.find({}).sort({ sourceCurrency: 1 });
    res.status(200).json({
        success: true,
        count: rates.length,
        rates
    });
});

/**
 * @desc    Initialize or Update a global currency rate
 * @route   POST /api/rates
 * @access  Private/Admin
 */
const upsertGlobalRate = asyncHandler(async (req, res) => {
    const { sourceCurrency, rate } = req.body;

    if (!sourceCurrency || rate === undefined) {
        res.status(400);
        throw new Error('Mandatory Prop: Currency and Rate are required');
    }

    // Attempt to update existing or create new pair
    let globalRate = await GlobalRate.findOne({ sourceCurrency: sourceCurrency.toUpperCase() });

    let oldRate = null;
    if (globalRate) {
        oldRate = globalRate.rate;
        globalRate.rate = Number(rate);
        globalRate.updatedBy = req.user._id;
        await globalRate.save();
    } else {
        globalRate = await GlobalRate.create({
            sourceCurrency: sourceCurrency.toUpperCase(),
            rate: Number(rate),
            updatedBy: req.user._id
        });
    }

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.RATE_UPDATE,
        description: `Admin ${req.user.email} modified global rate for ${globalRate.sourceCurrency}: ${oldRate || 'N/A'} -> ${globalRate.rate}`,
        details: { currency: globalRate.sourceCurrency, oldRate, newRate: globalRate.rate },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });

    res.status(200).json({
        success: true,
        rate: globalRate
    });
});

/**
 * @desc    Purge a global currency rate
 * @route   DELETE /api/rates/:id
 * @access  Private/Admin
 */
const deleteGlobalRate = asyncHandler(async (req, res) => {
    const rate = await GlobalRate.findById(req.params.id);

    if (!rate) {
        res.status(404);
        throw new Error('Record Not Found: Rate configuration does not exist');
    }

    await rate.deleteOne();

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.RATE_UPDATE,
        description: `Admin ${req.user.email} purged global rate config for ${rate.sourceCurrency}`,
        details: { currency: rate.sourceCurrency },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });

    res.status(200).json({
        success: true,
        message: 'Rate configuration purged'
    });
});

/**
 * @desc    Sync rates from free external API (Free Tier Friendly)
 * @route   POST /api/rates/sync
 * @access  Private/Admin
 */
const syncExternalRates = asyncHandler(async (req, res) => {

    // Industrial Approach: Use official ExchangeRate-API (v6) with API Key support
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const baseCurrency = 'LKR';

    // We try to use the authenticated endpoint first, fallback to the free open-access if no key
    const url = apiKey
        ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
        : `https://open.er-api.com/v6/latest/${baseCurrency}`;

    const response = await fetch(url);
    console.log(url);
    if (!response.ok) {
        res.status(500);
        throw new Error(`External provider error: ${response.statusText}. Please verify your API Key.`);
    }

    const data = await response.json();

    // Check for API-level errors (V6 specific)
    if (data.result === 'error') {
        res.status(400);
        throw new Error(`Provider API Error: ${data['error-type']}`);
    }

    const rates = apiKey ? data.conversion_rates : data.rates;

    // We only update currencies that already exist in our system
    // OR if the system is empty, we initialize common ones
    let existingRates = await GlobalRate.find({});

    if (existingRates.length === 0) {
        // First-time initialization: Seed common currencies and those from South Asia (matching image)
        const commonCurrencies = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'PKR', 'NPR'];
        const seedData = commonCurrencies.map(symbol => ({
            sourceCurrency: symbol,
            rate: 1 / (rates[symbol] || 1),
            updatedBy: req.user._id
        }));
        await GlobalRate.insertMany(seedData);
        existingRates = await GlobalRate.find({});
    }

    const updatedRates = [];
    const requiredSymbols = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'PKR', 'NPR'];

    // Create any missing required symbols
    for (const symbol of requiredSymbols) {
        let existing = existingRates.find(r => r.sourceCurrency === symbol);
        if (!existing && rates[symbol]) {
            const newRate = 1 / rates[symbol];
            existing = await GlobalRate.create({
                sourceCurrency: symbol,
                rate: Number((newRate * 1.002).toFixed(4)),
                updatedBy: req.user._id
            });
            updatedRates.push(existing);
        }
    }

    // Update all existing symbols
    for (const config of existingRates) {
        const livePairRate = rates[config.sourceCurrency];
        if (livePairRate) {
            // Formula: 1 / livePairRate gives us how many LKR for 1 Unit of Source
            const newRate = 1 / livePairRate;

            // Apply a default 0.2% markup for safety/profit
            config.rate = Number((newRate * 1.002).toFixed(4));
            config.updatedBy = req.user._id;
            await config.save();
            updatedRates.push(config);
        }
    }

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.RATE_UPDATE,
        description: `Admin ${req.user.email} triggered a global sync from external provider. Updated ${updatedRates.length} rates.`,
        details: { provider: 'ExchangeRate-API', count: updatedRates.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });


    res.status(200).json({
        success: true,
        message: `Successfully synchronized ${updatedRates.length} currency pairs`,
        rates: updatedRates
    });
});

export {
    getGlobalRates,
    upsertGlobalRate,
    deleteGlobalRate,
    syncExternalRates
};
