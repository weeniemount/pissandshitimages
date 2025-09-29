const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { supabase } = require('../utils/db.js');

async function validateDiscordToken(req, res, next) {
    if (!req.user || !req.user.access_token) {
        return res.status(401).send('No Discord authentication found. Please log in.');
    }

    try {
        // Validate token with Discord
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${req.user.access_token}`
            }
        });

        if (!response.ok) {
            // Token is invalid, try to use refresh token
            if (req.user.refresh_token) {
                const refreshData = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENT_ID,
                        client_secret: process.env.DISCORD_CLIENT_SECRET,
                        grant_type: 'refresh_token',
                        refresh_token: req.user.refresh_token
                    })
                }).then(r => r.json());

                if (refreshData.access_token) {
                    // Update tokens in database
                    await supabase
                        .from('discord_users')
                        .update({
                            access_token: refreshData.access_token,
                            refresh_token: refreshData.refresh_token
                        })
                        .eq('id', req.user.id);

                    req.user.access_token = refreshData.access_token;
                    return next();
                }
            }
            
            // If we can't refresh, user needs to re-authenticate
            return res.redirect('/auth/discord');
        }

        next();
    } catch (error) {
        console.error('Error validating Discord token:', error);
        res.status(500).send('Error validating Discord authentication');
    }
}

module.exports = validateDiscordToken;