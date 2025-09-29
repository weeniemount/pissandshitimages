const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { supabase } = require('../utils/db.js');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const { data, error } = await supabase
            .from('discord_users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            return done(null, null);
        }

        // Validate token immediately during deserialization
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${data.access_token}`
            }
        });

        if (!response.ok) {
            // Token invalid, return null to force re-authentication
            return done(null, null);
        }

        done(null, data);
    } catch (err) {
        done(null, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI,
    scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user is banned
        const { data: bannedUser, error: bannedError } = await supabase
            .from('banned_discord_users')
            .select('*')
            .eq('discord_id', profile.id)
            .single();

        if (bannedError && bannedError.code !== 'PGRST116') {
            throw bannedError;
        }

        if (bannedUser) {
            return done(null, false, { message: 'Your Discord account has been banned from uploading.' });
        }

        // Upsert user data
        const { data, error } = await supabase
            .from('discord_users')
            .upsert({
                id: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                avatar: profile.avatar,
                access_token: accessToken,
                refresh_token: refreshToken,
                last_login: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return done(null, data);
    } catch (err) {
        return done(err, null);
    }
}));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/discord');
}

function checkBannedDiscordUser(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    supabase
        .from('banned_discord_users')
        .select('*')
        .eq('discord_id', req.user.id)
        .single()
        .then(({ data }) => {
            if (data) {
                return res.status(403).send('Your Discord account has been banned from uploading.');
            }
            next();
        })
        .catch(error => {
            console.error('Error checking banned status:', error);
            next();
        });
}

module.exports = {
    passport,
    isAuthenticated,
    checkBannedDiscordUser
};