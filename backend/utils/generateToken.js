import jwt from 'jsonwebtoken';

/**
 * Safely cleans surrounding quotes and spaces from environment variables.
 */
const cleanExpiry = (val, defaultVal) => {
    if (!val || typeof val !== 'string') return defaultVal;
    const cleaned = val.replace(/^["']|["']$/g, '').trim();
    return cleaned || defaultVal;
};

/**
 * Generates and sets access and refresh tokens in secure cookies.
 */
const generateTokens = (res, userId) => {
    const accessExpire = cleanExpiry(process.env.ACCESS_TOKEN_EXPIRE, '15m');
    const refreshExpire = cleanExpiry(process.env.REFRESH_TOKEN_EXPIRE, '7d');

    // 1. Generate Access Token (Short-lived)
    const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: accessExpire,
    });

    // 2. Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: refreshExpire,
    });

    // 3. Set Cookie Options
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    };

    // 4. Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
        ...commonCookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // 5. Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
        ...commonCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return refreshToken; // Return this to be stored in the database
};

export default generateTokens;


