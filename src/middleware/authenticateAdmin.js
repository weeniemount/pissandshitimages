// Middleware to authenticate admin users
const supabase = require('../config/database');

async function authenticateAdmin(req, res, next) {
    try {
        // Check if session token exists in cookies
        const sessionToken = req.cookies.adminSession;
        
        if (!sessionToken) {
            return res.redirect('/admin/login');
        }
        
        // Check if session token is valid
        const { data, error } = await supabase
            .from('admin_sessions')
            .select('*')
            .eq('token', sessionToken)
            .gt('expires_at', new Date().toISOString())
            .single();
        
        if (error || !data) {
            // Clear invalid session cookie
            res.clearCookie('adminSession');
            return res.redirect('/admin/login');
        }
        
        // Store admin info in request object
        req.admin = {
            sessionId: data.id,
            userId: data.user_id,
            token: data.token
        };
        
        next();
    } catch (error) {
        console.error('Error authenticating admin:', error);
        res.clearCookie('adminSession');
        res.redirect('/admin/login');
    }
}

module.exports = authenticateAdmin;