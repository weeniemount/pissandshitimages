const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminPasswordRouter = express.Router();
const bcrypt = require('bcrypt');

// Password change functionality
adminPasswordRouter.get('/admin/change-password', authenticateAdmin, (req, res) => {
	const error = req.query.error;
	const success = req.query.success === 'true';

	res.render('admin/change-password', { error, success });
});


adminPasswordRouter.post('/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect('/admin/change-password?error=All fields are required');
    }
    
    if (newPassword !== confirmPassword) {
      return res.redirect('/admin/change-password?error=New passwords do not match');
    }
    
    if (newPassword.length < 8) {
      return res.redirect('/admin/change-password?error=Password must be at least 8 characters long');
    }
    
    // Get current admin user (assuming username is 'admin' for now)
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', 'admin')
      .single();
    
    if (userError || !adminUser) {
      return res.redirect('/admin/change-password?error=User not found');
    }
    
    // Verify current password
    const currentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    
    if (!currentPasswordValid) {
      return res.redirect('/admin/change-password?error=Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminUser.id);
    
    if (updateError) {
      console.error('Failed to update password:', updateError);
      return res.redirect('/admin/change-password?error=Failed to update password');
    }
    
    // Invalidate all other sessions except current one
    const currentSessionToken = req.cookies.adminSession;
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .neq('session_token', currentSessionToken);
    
    res.redirect('/admin/change-password?success=true');
    
  } catch (error) {
    console.error('Change password error:', error);
    res.redirect('/admin/change-password?error=An error occurred');
  }
});

module.exports = adminPasswordRouter;