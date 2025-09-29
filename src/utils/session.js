const { supabase } = require('./db.js');
const session = require('express-session');

class SupabaseStore extends session.Store {
    constructor() {
        super();
        this.initTable();
    }

    async initTable() {
        try {
            // Create the sessions table and set up RLS policies if needed
            const { error } = await supabase
                .from('sessions')
                .select('sid')
                .limit(1);

            if (error && error.code === '42P01') { // Table does not exist
                console.log('Creating sessions table...');
                // We'll use raw SQL via the REST API since Supabase JS client doesn't support DDL
                const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/create_sessions_table`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': process.env.SUPABASE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
                    }
                });
                
                if (!response.ok) {
                    console.error('Error creating sessions table:', await response.text());
                }
            }

            // Clean up expired sessions
            setInterval(async () => {
                try {
                    const { error: cleanupError } = await supabase
                        .from('sessions')
                        .delete()
                        .lt('expire', new Date().toISOString());

                    if (cleanupError) {
                        console.error('Error cleaning up expired sessions:', cleanupError);
                    }
                } catch (err) {
                    console.error('Session cleanup error:', err);
                }
            }, 15 * 60 * 1000); // Run every 15 minutes
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
            // Calculate expiration date from cookie
            let expire;
            if (session.cookie.expires) {
                // expires is already a Date object
                expire = new Date(session.cookie.expires).toISOString();
            } else if (session.cookie.maxAge) {
                // Calculate expiration from maxAge
                expire = new Date(Date.now() + session.cookie.maxAge).toISOString();
            } else {
                // Default to 24 hours if no expiration set
                expire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            }

            const sessData = {
                sid: sid,
                sess: JSON.stringify(session),
                expire: expire
            };
            
            console.log('Setting session:', { sid, expire, hasUser: !!session.passport?.user });
            
            const { error } = await supabase
                .from('sessions')
                .upsert(sessData);

            if (error) {
                console.error('Error setting session:', error);
                return callback(error);
            }
            console.log('Session saved successfully');
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

    // Add touch method to update session expiration
    async touch(sid, session, callback) {
        try {
            let expire;
            if (session.cookie.expires) {
                expire = new Date(session.cookie.expires).toISOString();
            } else if (session.cookie.maxAge) {
                expire = new Date(Date.now() + session.cookie.maxAge).toISOString();
            } else {
                expire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            }

            const { error } = await supabase
                .from('sessions')
                .update({ expire: expire })
                .eq('sid', sid);

            if (error) {
                console.error('Error touching session:', error);
                return callback(error);
            }
            callback(null);
        } catch (err) {
            console.error('Session store touch error:', err);
            callback(err);
        }
    }
}

const sessionMiddleware = session({
    store: new SupabaseStore(),
    secret: process.env.ADMIN_PASSWORD,
    resave: false, // Changed back to false since we now have touch()
    rolling: true, // Reset expiration on each request
    saveUninitialized: false,
    name: 'piss.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: 'lax'
        // Don't set domain - let it be automatic
    }
});

module.exports = sessionMiddleware;