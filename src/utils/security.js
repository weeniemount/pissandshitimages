// Security utilities
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Hash an IP address for privacy
function getHashedIP(ip) {
    // Remove IPv6 prefix if present (for localhost)
    const cleanIP = ip.replace(/^::ffff:/, '');
    
    // Create a hash of the IP
    return crypto.createHash('sha256')
        .update(cleanIP + process.env.IP_SALT)
        .digest('hex')
        .substring(0, 16); // Only use first 16 chars for brevity
}

// Generate a session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Hash a password
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Compare a password with a hash
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    getHashedIP,
    generateSessionToken,
    hashPassword,
    comparePassword
};