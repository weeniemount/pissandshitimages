const express = require('express');
const authRouter = express.Router();
const { passport } = require('../middleware/discordAuth');

authRouter.get('/auth/discord', passport.authenticate('discord'));

authRouter.get('/auth/discord/callback', 
    (req, res, next) => {
        passport.authenticate('discord', (err, user, info) => {
            if (err) {
                console.error('Discord auth error:', err);
                return res.redirect('/?error=' + encodeURIComponent(err.message));
            }
            if (!user) {
                return res.redirect('/?error=' + encodeURIComponent(info?.message || 'Authentication failed'));
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return res.redirect('/?error=' + encodeURIComponent(err.message));
                }
                res.redirect('/');
            });
        })(req, res, next);
    }
);

authRouter.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = authRouter;