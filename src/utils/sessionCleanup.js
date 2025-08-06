// Session cleanup utility
const supabase = require('../config/database');

// Cleanup expired admin sessions
async function cleanupExpiredSessions() {
    try {
        const now = new Date().toISOString();
        
        const { error } = await supabase
            .from('admin_sessions')
            .delete()
            .lt('expires_at', now);
        
        if (error) {
            console.error('Error cleaning up expired sessions:', error);
        } else {
            console.log(`Cleaned up expired sessions at ${now}`);
        }
    } catch (error) {
        console.error('Failed to clean up expired sessions:', error);
    }
}

// Schedule cleanup to run hourly
function scheduleSessionCleanup() {
    // Run immediately on startup
    cleanupExpiredSessions();
    
    // Then schedule to run hourly
    setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

module.exports = {
    cleanupExpiredSessions,
    scheduleSessionCleanup
};