const geoip = require('geoip-lite');

function countryTracker(req, res, next) {
    // Try to get the real IP address from various headers
    const ip = (
        req.headers['x-forwarded-for']?.split(',')[0] || 
        req.headers['x-real-ip'] ||
        req.ip ||
        req.connection.remoteAddress
    ).trim();

    // Clean the IP address
    const cleanIp = ip.replace(/^.*:/, '').replace(/[^0-9.]/g, '');
    
    // Look up the location
    const geo = geoip.lookup(cleanIp);
    
    // Add country info to the request object
    req.countryInfo = {
        country: geo ? geo.country : 'Unknown',
        // We specifically don't include city/region/ll for privacy
    };

    next();
}

module.exports = countryTracker;
