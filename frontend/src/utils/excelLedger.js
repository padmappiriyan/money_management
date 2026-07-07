export const parseAmount = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
};

/** Balance = B/F + Send − Paid − Deposit */
export const computeBalance = (bf, send, paid, deposit = 0) =>
    parseAmount(bf) + parseAmount(send) - parseAmount(paid) - parseAmount(deposit);

const TYPE_FIELD_MAP = {
    send: 'send',
    paid: 'paid',
    deposit: 'deposit',
};

export const getFieldForEntryType = (type) => TYPE_FIELD_MAP[type] || null;

export const applyEntryToRow = (row, type, amount) => {
    const field = getFieldForEntryType(type);
    if (!field) return row;

    const nextRow = { ...row };
    nextRow[field] = String(parseAmount(nextRow[field]) + parseAmount(amount));
    return nextRow;
};

export const normalizeEntryType = (type) => {
    if (type === 'receive') return 'paid';
    return type;
};

export const getPlatformKey = (platform) =>
    platform?.slug || platform?.id || platform?._id;

export const findPlatformByValue = (platforms, value) => {
    if (!value) return undefined;
    const normalized = String(value).toLowerCase();
    return platforms.find(
        (platform) =>
            String(platform.slug || '').toLowerCase() === normalized ||
            String(platform.id || '') === String(value) ||
            String(platform._id || '') === String(value)
    );
};

export const getPlatformId = (platform) => platform?.id || platform?._id;
