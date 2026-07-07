const DEBUG = process.env.NODE_ENV !== "production";

const log = (...args) => {
  if (DEBUG) console.log('[LOG]', ...args);
};

const warn = (...args) => {
  if (DEBUG) console.warn('[WARN]', ...args);
};

const error = (...args) => {
  console.error('[ERROR]', ...args);
};

module.exports = { log, warn, error };