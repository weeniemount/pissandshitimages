const express = require('express');
const authRouter = express.Router();
const { supabase } = require('../utils/db.js');
const { generateAuthToken, exchangeCode, getDiscordUser } = require('../middleware/discordAuth.js');

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

// Initiate Discord OAuth2 flow
authRouter.get('/auth/discord', (req, res) => {
    // Store the return_to URL in the OAuth state
    const state = req.query.return_to ? 
        Buffer.from(JSON.stringify({ return_to: req.query.return_to })).toString('base64') : 
        undefined;

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify',
        state: state
    });

    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// Discord OAuth2 callback
authRouter.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    // Parse the state if it exists
    let returnTo;
    if (state) {
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            returnTo = stateData.return_to;
        } catch (e) {
            console.error('Failed to parse state:', e);
        }
    }

    try {
        // Exchange code for access token
        const tokenData = await exchangeCode(code);
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }

        // Get user info from Discord
        const discordUser = await getDiscordUser(tokenData.access_token);
        if (!discordUser.id) {
            throw new Error('Failed to get user info');
        }

        // Generate auth token for our API
        const auth_token = await generateAuthToken();

        // Upsert user in our database
        const { data: user, error } = await supabase
            .from('discord_users')
            .upsert({
                discord_id: discordUser.id,
                username: discordUser.username,
                avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
                auth_token,
                last_login: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Set auth token cookie
        res.cookie('auth_token', auth_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Handle different redirect cases
        if (req.query.sharex === 'true') {
            // Serve ShareX config
            const config = {
                Version: "13.7.0",
                Name: "pissandshitimages.com",
                DestinationType: "ImageUploader",
                RequestMethod: "POST",
                RequestURL: `${process.env.BASE_URL || 'http://localhost:3000'}/upload`,
                Headers: {
                    "x-auth-token": auth_token
                },
                Body: "MultipartFormData",
                FileFormName: "image"
            };

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
            return res.send(JSON.stringify(config, null, 2));
        } else if (req.query.return_to) {
            // Redirect to the specified return URL if it's within our site
            const returnUrl = new URL(req.query.return_to, process.env.BASE_URL || 'http://localhost:3000');
            if (returnUrl.hostname === req.hostname) {
                return res.redirect(req.query.return_to);
            }
        }

        // Default redirect to gallery
        res.redirect('/gallery');
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).send('Authentication failed');
    }
});

// Generate ShareX config for authenticated users
authRouter.get('/sharex-config', async (req, res) => {
    const auth_token = req.cookies.auth_token;

    if (!auth_token) {
        return res.redirect('/auth/discord?sharex=true');
    }

    const config = {
        Version: "13.7.0",
        Name: "pissandshitimages.com",
        DestinationType: "ImageUploader",
        RequestMethod: "POST",
        RequestURL: `${process.env.BASE_URL || 'http://localhost:3000'}/upload`,
        Headers: {
            "x-auth-token": auth_token
        },
        Body: "MultipartFormData",
        FileFormName: "image"
    };

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
    res.send(JSON.stringify(config, null, 2));
});

module.exports = authRouter;
