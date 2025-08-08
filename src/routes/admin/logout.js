const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminLogoutRouter = express.Router();

// Admin logout
adminLogoutRouter.get('/admin/logout', authenticateAdmin, async (req, res) => {
  try {
    const sessionToken = req.cookies.adminSession;
    
    if (sessionToken) {
      // Invalidate session in database
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
    }
    
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  }
});


// Admin logout
adminLogoutRouter.get('/admin/logout', (req, res) => {
  res.clearCookie('adminAuth');
  res.redirect('/admin/login');
});

module.exports = adminLogoutRouter;