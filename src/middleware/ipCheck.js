const crypto = require('crypto');
const { supabase } = require('../utils/db.js');

// Helper function to get client IP
function getHashedIP(req) {
  // Get the real IP address (handles proxies and load balancers)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  return ip.toString();
}

// Middleware to check if IP is banned
async function checkBannedIP(req, res, next) {
  try {
    const ip = getHashedIP(req);
    
    // Check if the IP is banned either as a hash or as plain IP
    const { data: bannedIP, error } = await supabase
      .from('banned_ips')
      .select('banned_at, ip_hash')
      .or(`ip_hash.eq.${ip},ip_hash.eq.${crypto.createHash('sha256').update(ip).digest('hex')}`)
      .single();
    
    if (bannedIP) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Banned - pissandshitimages</title>
            <style>
                body {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    background: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff6b6b; font-size: 3em; }
                .banned-message {
                    background: #ff4757;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 600px;
                }
            </style>
        </head>
        <body>
        <script src="/oneko.js"></script>
            <h1>🚫 BANNED 🚫</h1>
            <div class="banned-message">
                <h2>Your IP has been banned!</h2>
                <p>You were banned on: ${new Date(bannedIP.banned_at).toLocaleString()}</p>
                <p>Reason: Inappropriate content upload</p>
                <p>If you believe this is an error, contact the admin.</p>
            </div>
        </body>
        </html>
      `);
    }
    
    next();
  } catch (error) {
    console.error('Error checking banned IP:', error);
    next(); // Allow request to continue if there's an error
  }
}

module.exports = {
    checkBannedIP,
    getHashedIP
}