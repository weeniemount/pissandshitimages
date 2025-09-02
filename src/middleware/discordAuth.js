const { supabase } = require('../utils/db.js');
const crypto = require('crypto');
const fetch = require('node-fetch');

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

async function generateAuthToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function exchangeCode(code) {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: DISCORD_REDIRECT_URI,
        scope: 'identify',
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
    });

    return response.json();
}

async function getDiscordUser(access_token) {
    const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    return response.json();
}

async function authenticateDiscordToken(req, res, next) {
    const auth_token = req.headers['x-auth-token'] || req.cookies.auth_token;

    if (!auth_token) {
        req.user = null;
        return next();
    }

    try {
        const { data: user, error } = await supabase
            .from('discord_users')
            .select('*')
            .eq('auth_token', auth_token)
            .single();

        if (error || !user) {
            req.user = null;
            return next();
        }

        // Update last login
        await supabase
            .from('discord_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        req.user = user;
        next();
    } catch (err) {
        console.error('Discord auth error:', err);
        req.user = null;
        next();
    }
}

module.exports = {
    authenticateDiscordToken,
    generateAuthToken,
    exchangeCode,
    getDiscordUser
};
