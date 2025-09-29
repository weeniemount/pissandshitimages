const express = require('express');
const discordBanRouter = express.Router();
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const { supabase } = require('../../utils/db.js');

discordBanRouter.get('/admin/banned-discord', authenticateAdmin, async (req, res) => {
    try {
        const { data: bannedUsers, error } = await supabase
            .from('banned_discord_users')
            .select(`
                *,
                discord_users (
                    username,
                    discriminator,
                    avatar
                )
            `);

        if (error) throw error;

        res.render('admin/banned-discord', { bannedUsers });
    } catch (error) {
        console.error('Error fetching banned Discord users:', error);
        res.status(500).render('admin/error', { error: 'Failed to fetch banned Discord users' });
    }
});

discordBanRouter.post('/admin/discord/ban/:id', authenticateAdmin, async (req, res) => {
    const discordId = req.params.id;
    const reason = req.body.reason || 'No reason provided';

    try {
        const { error } = await supabase
            .from('banned_discord_users')
            .insert([{
                discord_id: discordId,
                banned_by: req.session.adminId,
                reason: reason,
                banned_at: new Date().toISOString()
            }]);

        if (error) throw error;
        res.redirect('/admin/banned-discord');
    } catch (error) {
        console.error('Error banning Discord user:', error);
        res.status(500).render('admin/error', { error: 'Failed to ban Discord user' });
    }
});

discordBanRouter.post('/admin/discord/unban/:id', authenticateAdmin, async (req, res) => {
    const discordId = req.params.id;

    try {
        const { error } = await supabase
            .from('banned_discord_users')
            .delete()
            .eq('discord_id', discordId);

        if (error) throw error;
        res.redirect('/admin/banned-discord');
    } catch (error) {
        console.error('Error unbanning Discord user:', error);
        res.status(500).render('admin/error', { error: 'Failed to unban Discord user' });
    }
});

module.exports = discordBanRouter;