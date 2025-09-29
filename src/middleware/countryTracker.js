const geoip = require('geoip-lite');

function countryTracker(req, res, next) {
    // Try to get the real IP address from various headers
    const ip = (
        req.headers['x-forwarded-for']?.split(',')[0] || 
        req.headers['x-real-ip'] ||
        req.ip ||
        req.connection.remoteAddress
    ).trim();

    // Handle special cases first
    if (ip === '::1' || ip === '127.0.0.1') {
        req.countryInfo = {
            country: 'Local',
        };
        return next();
    }

    // Clean the IP address - handle both IPv4 and IPv6
    let cleanIp = ip;
    
    // Handle IPv4-mapped IPv6 addresses
    if (ip.startsWith('::ffff:')) {
        cleanIp = ip.substring(7);
    } else if (ip.includes(':')) {
        // For other IPv6, keep as is - geoip-lite can handle IPv6
        cleanIp = ip;
    }
    
    // Remove any remaining unwanted characters but preserve dots and colons
    cleanIp = cleanIp.replace(/[^0-9.:]/g, '');
    
    // Look up the location
    const geo = geoip.lookup(cleanIp);
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('IP Detection:', {
            original: ip,
            cleaned: cleanIp,
            country: geo ? geo.country : 'Unknown'
        });
    }
    
    // Add country info to the request object
    req.countryInfo = {
        country: geo ? geo.country : 'Unknown',
        // We specifically don't include city/region/ll for privacy
    };

    next();
}

module.exports = countryTracker;
