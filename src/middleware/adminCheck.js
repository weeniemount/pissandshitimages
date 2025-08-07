const loginAttempts = new Map();
const { supabase } = require('../db.js');
const { getHashedIP } = require('./ipCheck.js');
const crypto = require('crypto');

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Clean up expired sessions (run periodically)
async function cleanupExpiredSessions() {
  const { error } = await supabase
    .from('admin_sessions')
    .delete()
    .lt('expires_at', new Date().toISOString());
    
  if (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Secure admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.adminSession;
    
    if (!sessionToken) {
      return res.redirect('/admin/login');
    }

    // Verify session in database
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      // Invalid or expired session, clear cookie
      res.clearCookie('adminSession');
      return res.redirect('/admin/login');
    }

    // Optional: Check if IP matches (for extra security)
    const currentIPHash = getHashedIP(req);
    if (session.ip_hash && session.ip_hash !== currentIPHash) {
      console.warn('Session IP mismatch detected');
      // You can choose to invalidate session here or just log it
      // For now, we'll allow it but log the warning
    }

    // Session is valid, attach session info to request
    req.adminSession = session;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.clearCookie('adminSession');
    res.redirect('/admin/login');
  }
};


function recordLoginAttempt(ip, success = false) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(ip);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(ip, attempts);
  }
}


function isRateLimited(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  
  // Reset counter if time window has passed
  if (now - attempts.lastAttempt > timeWindow) {
    attempts.count = 0;
  }
  
  return attempts.count >= 5; // Max 5 attempts per 15 minutes
}

module.exports = {
    generateSessionToken,
    authenticateAdmin,
    recordLoginAttempt,
    cleanupExpiredSessions,
    isRateLimited
};
