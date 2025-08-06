// Middleware to check if an IP is banned
const supabase = require('../config/database');
const { getHashedIP } = require('../utils/security');

async function checkBannedIP(req, res, next) {
    try {
        const ipHash = getHashedIP(req.ip);
        
        // Check if IP is banned
        const { data, error } = await supabase
            .from('banned_ips')
            .select('*')
            .eq('ip_hash', ipHash)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error checking banned IP:', error);
            return next();
        }
        
        // If IP is banned, send banned message
        if (data) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Banned</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            color: #333;
                            text-align: center;
                            padding: 50px 20px;
                            margin: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        h1 {
                            color: #d9534f;
                        }
                        p {
                            font-size: 18px;
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>You Are Banned</h1>
                        <p>Your IP address has been banned from using this service.</p>
                        <p>If you believe this is an error, please contact the administrator.</p>
                    </div>
                </body>
                </html>
            `);
        }
        
        next();
    } catch (error) {
        console.error('Error in banned IP middleware:', error);
        next();
    }
}

module.exports = checkBannedIP;