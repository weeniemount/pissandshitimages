const geoip = require('geoip-lite');

function countryTracker(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    // Add country info to the request object
    req.countryInfo = {
        country: geo ? geo.country : 'Unknown',
        // We specifically don't include city/region/ll for privacy
    };
    
    next();
}

module.exports = countryTracker;
