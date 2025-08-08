const { supabase } = require('../../utils/db.js');
const { getHashedIP } = require('../../middleware/ipCheck.js');
const { generateSessionToken, recordLoginAttempt, isRateLimited } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminLoginRouter = express.Router();
const bcrypt = require('bcrypt');

// Admin login page
adminLoginRouter.get('/admin/login', (req, res) => {
	const error = req.query.error;
	const rateLimited = req.query.rate_limited === 'true';
	res.render('admin/login', { error, rateLimited });
});

adminLoginRouter.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = getHashedIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return res.redirect('/admin/login?rate_limited=true');
    }
    
    if (!username || !password) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Username and password are required');
    }
    
    // Get admin user from database
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();
    
    if (userError || !adminUser) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Invalid username or password');
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, adminUser.password_hash);
    
    if (!passwordValid) {
      recordLoginAttempt(clientIP, false);
      return res.redirect('/admin/login?error=Invalid username or password');
    }
    
    // Create new session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour sessions
    
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert([{
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_hash: clientIP,
        user_agent: userAgent
      }]);
    
    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return res.redirect('/admin/login?error=Login failed. Please try again.');
    }
    
    // Set secure session cookie
    res.cookie('adminSession', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    recordLoginAttempt(clientIP, true); // Clear rate limiting
    res.redirect('/admin');
    
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=An error occurred. Please try again.');
  }
});

module.exports = adminLoginRouter;