const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminSessionsRouter = express.Router();

// Add session management page
adminSessionsRouter.get('/admin/sessions', authenticateAdmin, async (req, res) => {
	const { data: sessions, error } = await supabase
		.from('admin_sessions')
		.select('*')
		.eq('is_active', true)
		.order('created_at', { ascending: false });
		
	if (error) return res.status(500).send('DB error: ' + error.message);
	
	const currentSessionToken = req.cookies.adminSession;
	
	res.render('admin/sessions', { sessions, currentSessionToken });
});


// Revoke session
adminSessionsRouter.post('/admin/revoke-session/:token', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('session_token', req.params.token);
    
  if (error) {
    res.status(500).send('Error revoking session: ' + error.message);
  } else {
    res.redirect('/admin/sessions');
  }
});

module.exports = adminSessionsRouter;