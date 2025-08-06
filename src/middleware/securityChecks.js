// Security middleware

// Middleware to forbid requests containing sensitive parameters
function forbidSensitiveParams(req, res, next) {
    const forbiddenParams = ['env', 'process', 'secret'];
    
    // Check if any query parameter contains forbidden words
    const hasIllegalParams = Object.keys(req.query).some(param => {
        return forbiddenParams.some(forbidden => 
            param.toLowerCase().includes(forbidden.toLowerCase()));
    });
    
    if (hasIllegalParams) {
        return res.status(403).send('Forbidden request');
    }
    
    next();
}

module.exports = {
    forbidSensitiveParams
};