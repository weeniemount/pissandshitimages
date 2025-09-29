const express = require('express');
const authRouter = express.Router();
const { passport } = require('../middleware/discordAuth');

authRouter.get('/auth/discord', passport.authenticate('discord'));

authRouter.get('/auth/discord/callback', 
    passport.authenticate('discord', {
        failureRedirect: '/?error=auth_failed'
    }), 
    (req, res) => {
        res.redirect('/');
    }
);

authRouter.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = authRouter;