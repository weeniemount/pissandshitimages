const { supabase } = require('./db.js');
const session = require('express-session');

class SupabaseStore extends session.Store {
    constructor() {
        super();
        this.initTable();
    }

    async initTable() {
        try {
            // Create the sessions table if it doesn't exist
            const { error } = await supabase.rpc('create_sessions_table');
            if (error) {
                console.error('Error creating sessions table:', error);
            }
        } catch (err) {
            console.error('Error initializing sessions table:', err);
        }
    }

    async get(sid, callback) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('sess')
                .eq('sid', sid)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No session found, this is normal
                    return callback(null, null);
                }
                console.error('Error getting session:', error);
                return callback(error, null);
            }
            
            if (!data || !data.sess) {
                return callback(null, null);
            }

            try {
                const sess = JSON.parse(data.sess);
                callback(null, sess);
            } catch (parseErr) {
                console.error('Error parsing session data:', parseErr);
                callback(parseErr, null);
            }
        } catch (err) {
            console.error('Session store get error:', err);
            callback(err, null);
        }
    }

    async set(sid, session, callback) {
        try {
            const sessData = {
                sid: sid,
                sess: JSON.stringify(session),
                expire: session.cookie.expires.toISOString()
            };
            
            const { error } = await supabase
                .from('sessions')
                .upsert(sessData);

            if (error) {
                console.error('Error setting session:', error);
                return callback(error);
            }
            callback(null);
        } catch (err) {
            console.error('Session store set error:', err);
            callback(err);
        }
    }

    async destroy(sid, callback) {
        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('sid', sid);

            if (error) {
                console.error('Error destroying session:', error);
                return callback(error);
            }
            callback(null);
        } catch (err) {
            console.error('Session store destroy error:', err);
            callback(err);
        }
    }
}

const sessionMiddleware = session({
    store: new SupabaseStore(),
    secret: process.env.ADMIN_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});

module.exports = sessionMiddleware;