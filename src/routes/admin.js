// Admin routes
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { getHashedIP, generateSessionToken, comparePassword, hashPassword } = require('../utils/security');
const { getImageStats } = require('../utils/stats');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Login rate limiting
const loginAttempts = {};
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Admin login page
router.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Login - Piss and Shit Images</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                    color: #333;
                }
                h1 {
                    color: #ff6600;
                    text-align: center;
                }
                .login-form {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                input[type="text"],
                input[type="password"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                button {
                    background-color: #ff6600;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    width: 100%;
                }
                button:hover {
                    background-color: #e55c00;
                }
                .error {
                    color: #dc3545;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #f8d7da;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <h1>Admin Login</h1>
            
            ${req.query.error ? `<div class="error">${req.query.error}</div>` : ''}
            
            <div class="login-form">
                <form action="/admin/login" method="post">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Admin login POST
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check for missing fields
        if (!username || !password) {
            return res.redirect('/admin/login?error=Username+and+password+required');
        }
        
        // Check rate limiting
        const ipHash = getHashedIP(req.ip);
        
        if (loginAttempts[ipHash]) {
            if (loginAttempts[ipHash].count >= MAX_LOGIN_ATTEMPTS) {
                const timeLeft = (loginAttempts[ipHash].timeout - Date.now()) / 1000 / 60;
                return res.redirect(`/admin/login?error=Too+many+login+attempts.+Try+again+in+${Math.ceil(timeLeft)}+minutes`);
            }
        } else {
            loginAttempts[ipHash] = { count: 0 };
        }
        
        // Get admin user from database
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error || !admin) {
            // Increment failed attempts
            loginAttempts[ipHash].count++;
            
            if (loginAttempts[ipHash].count >= MAX_LOGIN_ATTEMPTS) {
                loginAttempts[ipHash].timeout = Date.now() + LOGIN_TIMEOUT;
                
                // Schedule cleanup
                setTimeout(() => {
                    delete loginAttempts[ipHash];
                }, LOGIN_TIMEOUT);
            }
            
            return res.redirect('/admin/login?error=Invalid+username+or+password');
        }
        
        // Check password
        const passwordMatch = await comparePassword(password, admin.password);
        
        if (!passwordMatch) {
            // Increment failed attempts
            loginAttempts[ipHash].count++;
            
            if (loginAttempts[ipHash].count >= MAX_LOGIN_ATTEMPTS) {
                loginAttempts[ipHash].timeout = Date.now() + LOGIN_TIMEOUT;
                
                // Schedule cleanup
                setTimeout(() => {
                    delete loginAttempts[ipHash];
                }, LOGIN_TIMEOUT);
            }
            
            return res.redirect('/admin/login?error=Invalid+username+or+password');
        }
        
        // Reset login attempts
        delete loginAttempts[ipHash];
        
        // Generate session token
        const token = generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        
        // Store session in database
        const { error: sessionError } = await supabase
            .from('admin_sessions')
            .insert([
                {
                    user_id: admin.id,
                    token,
                    ip_hash: ipHash,
                    user_agent: req.headers['user-agent'] || 'Unknown',
                    expires_at: expiresAt.toISOString()
                }
            ]);
        
        if (sessionError) {
            console.error('Error creating session:', sessionError);
            return res.redirect('/admin/login?error=Session+creation+failed');
        }
        
        // Set session cookie
        res.cookie('adminSession', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Redirect to admin panel
        res.redirect('/admin');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/admin/login?error=Login+failed');
    }
});

// Admin logout
router.get('/logout', authenticateAdmin, async (req, res) => {
    try {
        if (req.admin && req.admin.token) {
            // Delete session from database
            await supabase
                .from('admin_sessions')
                .delete()
                .eq('token', req.admin.token);
        }
        
        // Clear session cookie
        res.clearCookie('adminSession');
        
        res.redirect('/admin/login');
    } catch (error) {
        console.error('Logout error:', error);
        res.redirect('/admin');
    }
});

// Admin sessions page
router.get('/sessions', authenticateAdmin, async (req, res) => {
    try {
        // Get all active sessions for the admin
        const { data: sessions, error } = await supabase
            .from('admin_sessions')
            .select('*')
            .eq('user_id', req.admin.userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Generate HTML for the sessions page
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Sessions - Piss and Shit Images</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    h1 {
                        color: #ff6600;
                        text-align: center;
                    }
                    .sessions {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #eee;
                    }
                    th {
                        background-color: #f9f9f9;
                        font-weight: bold;
                    }
                    tr:hover {
                        background-color: #f5f5f5;
                    }
                    .current {
                        background-color: #e6f7ff;
                    }
                    .actions {
                        text-align: center;
                    }
                    .revoke-btn {
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .revoke-btn:hover {
                        background-color: #c82333;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        margin: 0 10px;
                        color: #0066cc;
                        text-decoration: none;
                    }
                    .links a:hover {
                        text-decoration: underline;
                    }
                    .no-sessions {
                        text-align: center;
                        padding: 20px;
                        font-size: 18px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <h1>Active Admin Sessions</h1>
                
                <div class="sessions">
                    <table>
                        <thead>
                            <tr>
                                <th>Created</th>
                                <th>Expires</th>
                                <th>IP Hash</th>
                                <th>User Agent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (sessions.length === 0) {
            html += `
                <tr>
                    <td colspan="5" class="no-sessions">No active sessions found</td>
                </tr>
            `;
        } else {
            sessions.forEach(session => {
                const created = new Date(session.created_at).toLocaleString();
                const expires = new Date(session.expires_at).toLocaleString();
                const isCurrent = session.token === req.admin.token;
                
                html += `
                    <tr${isCurrent ? ' class="current"' : ''}>
                        <td>${created}</td>
                        <td>${expires}</td>
                        <td>${session.ip_hash}</td>
                        <td>${session.user_agent}</td>
                        <td class="actions">
                            ${isCurrent ? 
                                '<strong>Current Session</strong>' : 
                                `<form action="/admin/revoke-session/${session.token}" method="post">
                                    <button type="submit" class="revoke-btn">Revoke</button>
                                </form>`
                            }
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <div class="links">
                    <a href="/admin">Back to Admin Panel</a>
                    <a href="/admin/change-password">Change Password</a>
                    <a href="/admin/logout">Logout</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error getting sessions:', error);
        res.status(500).send('Error getting sessions');
    }
});

// Revoke session
router.post('/revoke-session/:token', authenticateAdmin, async (req, res) => {
    try {
        const token = req.params.token;
        
        // Don't allow revoking current session
        if (token === req.admin.token) {
            return res.redirect('/admin/sessions');
        }
        
        // Delete session from database
        await supabase
            .from('admin_sessions')
            .delete()
            .eq('token', token);
        
        res.redirect('/admin/sessions');
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).send('Error revoking session');
    }
});

// Change password page
router.get('/change-password', authenticateAdmin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Change Password - Piss and Shit Images</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                    color: #333;
                }
                h1 {
                    color: #ff6600;
                    text-align: center;
                }
                .form-container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                input[type="password"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                button {
                    background-color: #ff6600;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    width: 100%;
                }
                button:hover {
                    background-color: #e55c00;
                }
                .error {
                    color: #dc3545;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #f8d7da;
                    border-radius: 4px;
                }
                .success {
                    color: #28a745;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #d4edda;
                    border-radius: 4px;
                }
                .links {
                    text-align: center;
                    margin-top: 20px;
                }
                .links a {
                    margin: 0 10px;
                    color: #0066cc;
                    text-decoration: none;
                }
                .links a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Change Password</h1>
            
            ${req.query.error ? `<div class="error">${req.query.error}</div>` : ''}
            ${req.query.success ? `<div class="success">${req.query.success}</div>` : ''}
            
            <div class="form-container">
                <form action="/admin/change-password" method="post">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>
                    <button type="submit">Change Password</button>
                </form>
            </div>
            
            <div class="links">
                <a href="/admin">Back to Admin Panel</a>
                <a href="/admin/sessions">Manage Sessions</a>
            </div>
        </body>
        </html>
    `);
});

// Change password POST
router.post('/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Check for missing fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.redirect('/admin/change-password?error=All+fields+are+required');
        }
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.redirect('/admin/change-password?error=New+passwords+do+not+match');
        }
        
        // Check password length
        if (newPassword.length < 8) {
            return res.redirect('/admin/change-password?error=New+password+must+be+at+least+8+characters');
        }
        
        // Get admin user from database
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', req.admin.userId)
            .single();
        
        if (error || !admin) {
            return res.redirect('/admin/change-password?error=User+not+found');
        }
        
        // Check current password
        const passwordMatch = await comparePassword(currentPassword, admin.password);
        
        if (!passwordMatch) {
            return res.redirect('/admin/change-password?error=Current+password+is+incorrect');
        }
        
        // Hash new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update password in database
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({ password: hashedPassword })
            .eq('id', req.admin.userId);
        
        if (updateError) {
            console.error('Error updating password:', updateError);
            return res.redirect('/admin/change-password?error=Failed+to+update+password');
        }
        
        // Invalidate all other sessions
        await supabase
            .from('admin_sessions')
            .delete()
            .eq('user_id', req.admin.userId)
            .neq('token', req.admin.token);
        
        res.redirect('/admin/change-password?success=Password+changed+successfully');
    } catch (error) {
        console.error('Error changing password:', error);
        res.redirect('/admin/change-password?error=Failed+to+change+password');
    }
});

// Admin panel
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        // Get page from query params
        const page = parseInt(req.query.page) || 1;
        const perPage = 20;
        const offset = (page - 1) * perPage;
        
        // Get images with pagination
        const { data: images, error, count } = await supabase
            .from('images')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + perPage - 1);
        
        if (error) throw error;
        
        // Get IP info for each image
        const imageIds = images.map(img => img.id);
        
        const { data: postIps, error: ipError } = await supabase
            .from('post_ips')
            .select('*')
            .in('post_id', imageIds);
        
        if (ipError) throw ipError;
        
        // Map IP info to images
        const ipMap = {};
        postIps.forEach(ip => {
            ipMap[ip.post_id] = ip.ip_hash;
        });
        
        // Get image stats
        const stats = await getImageStats();
        
        // Get banned IPs count
        const { count: bannedCount, error: bannedError } = await supabase
            .from('banned_ips')
            .select('*', { count: 'exact', head: true });
        
        if (bannedError) throw bannedError;
        
        // Calculate pagination
        const totalPages = Math.ceil(count / perPage);
        let pagination = '';
        
        if (totalPages > 1) {
            pagination = '<div class="pagination">';
            
            // Previous page
            if (page > 1) {
                pagination += `<a href="/admin?page=${page - 1}">Previous</a>`;
            }
            
            // Page numbers
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, page + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === page) {
                    pagination += `<a href="/admin?page=${i}" class="active">${i}</a>`;
                } else {
                    pagination += `<a href="/admin?page=${i}">${i}</a>`;
                }
            }
            
            // Next page
            if (page < totalPages) {
                pagination += `<a href="/admin?page=${page + 1}">Next</a>`;
            }
            
            pagination += '</div>';
        }
        
        // Generate HTML for the admin panel
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Panel - Piss and Shit Images</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    h1 {
                        color: #ff6600;
                        text-align: center;
                    }
                    .stats-container {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .stat-box {
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin: 10px;
                        flex: 1;
                        min-width: 200px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #ff6600;
                    }
                    .images-container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                        overflow-x: auto;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #eee;
                    }
                    th {
                        background-color: #f9f9f9;
                        font-weight: bold;
                    }
                    tr:hover {
                        background-color: #f5f5f5;
                    }
                    .thumbnail {
                        width: 100px;
                        height: 75px;
                        object-fit: cover;
                        border-radius: 4px;
                    }
                    .actions {
                        display: flex;
                        gap: 5px;
                    }
                    .btn {
                        padding: 5px 10px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        color: white;
                    }
                    .btn-danger {
                        background-color: #dc3545;
                    }
                    .btn-warning {
                        background-color: #ffc107;
                        color: #212529;
                    }
                    .btn-info {
                        background-color: #17a2b8;
                    }
                    .btn-success {
                        background-color: #28a745;
                    }
                    .btn:hover {
                        opacity: 0.9;
                    }
                    .pagination {
                        display: flex;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .pagination a {
                        margin: 0 5px;
                        padding: 8px 12px;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        color: #333;
                        text-decoration: none;
                    }
                    .pagination a:hover {
                        background-color: #f5f5f5;
                    }
                    .pagination .active {
                        background-color: #ff6600;
                        color: white;
                        border-color: #ff6600;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        margin: 0 10px;
                        color: #0066cc;
                        text-decoration: none;
                    }
                    .links a:hover {
                        text-decoration: underline;
                    }
                    .success-message {
                        background-color: #d4edda;
                        color: #155724;
                        padding: 10px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .shitlevel {
                        display: inline-block;
                        padding: 3px 6px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .lucky {
                        background-color: #d4edda;
                        color: #155724;
                    }
                    .normal {
                        background-color: #fff3cd;
                        color: #856404;
                    }
                    .extreme {
                        background-color: #f8d7da;
                        color: #721c24;
                    }
                    .hidden {
                        background-color: #e2e3e5;
                        color: #383d41;
                    }
                </style>
            </head>
            <body>
                <h1>Admin Panel</h1>
                
                ${req.query.success ? `<div class="success-message">${req.query.success}</div>` : ''}
                
                <div class="stats-container">
                    <div class="stat-box">
                        <div>Total Images</div>
                        <div class="stat-value">${stats.totalCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Visible Images</div>
                        <div class="stat-value">${stats.visibleCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Hidden Images</div>
                        <div class="stat-value">${stats.hiddenCount}</div>
                    </div>
                    <div class="stat-box">
                        <div>Banned IPs</div>
                        <div class="stat-value">${bannedCount}</div>
                    </div>
                </div>
                
                <div class="stats-container">
                    <div class="stat-box">
                        <div>Roll Stats</div>
                        <div class="stat-value">${stats.averageRoll}%</div>
                        <div>Average Roll</div>
                    </div>
                    <div class="stat-box">
                        <div>Lucky Survivors</div>
                        <div class="stat-value">${stats.rollStats.lucky}</div>
                    </div>
                    <div class="stat-box">
                        <div>Normal Shittification</div>
                        <div class="stat-value">${stats.rollStats.normal}</div>
                    </div>
                    <div class="stat-box">
                        <div>Extreme Nuclear</div>
                        <div class="stat-value">${stats.rollStats.extreme}</div>
                    </div>
                </div>
                
                <div class="stats-container">
                    <div class="stat-box">
                        <div>Storage</div>
                        <div class="stat-value">${stats.storage.savedPercentage}%</div>
                        <div>Space Saved</div>
                    </div>
                    <div class="stat-box">
                        <div>Original Size</div>
                        <div class="stat-value">${stats.storage.original}</div>
                    </div>
                    <div class="stat-box">
                        <div>Processed Size</div>
                        <div class="stat-value">${stats.storage.processed}</div>
                    </div>
                    <div class="stat-box">
                        <div>Saved</div>
                        <div class="stat-value">${stats.storage.saved}</div>
                    </div>
                </div>
                
                <div class="images-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>ID</th>
                                <th>Filename</th>
                                <th>Shitlevel</th>
                                <th>Date</th>
                                <th>IP</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        images.forEach(image => {
            const date = new Date(image.created_at).toLocaleString();
            const isHidden = image.mimetype.includes('hidden');
            let shitLevelClass = '';
            let shitLevelText = '';
            
            if (isHidden) {
                shitLevelClass = 'hidden';
                shitLevelText = 'HIDDEN';
            } else if (image.gamblingResult === 'LUCKY_SURVIVOR') {
                shitLevelClass = 'lucky';
                shitLevelText = 'LUCKY';
            } else if (image.gamblingResult === 'NORMAL_SHIT') {
                shitLevelClass = 'normal';
                shitLevelText = 'NORMAL';
            } else if (image.gamblingResult === 'EXTREME_NUCLEAR') {
                shitLevelClass = 'extreme';
                shitLevelText = 'EXTREME';
            }
            
            html += `
                <tr>
                    <td>
                        <a href="/image/${image.id}" target="_blank">
                            <img src="/raw/${image.id}" alt="${image.originalname}" class="thumbnail">
                        </a>
                    </td>
                    <td>${image.id}</td>
                    <td>${image.originalname}</td>
                    <td>
                        <span class="shitlevel ${shitLevelClass}">${shitLevelText}</span>
                        ${image.rollPercentage ? `(${image.rollPercentage}%)` : ''}
                    </td>
                    <td>${date}</td>
                    <td>
                        ${ipMap[image.id] ? ipMap[image.id] : 'Unknown'}
                        ${ipMap[image.id] ? 
                            `<form action="/admin/ban-ip/${image.id}" method="post" style="display: inline;">
                                <button type="submit" class="btn btn-warning" style="margin-left: 5px;">Ban IP</button>
                            </form>` : 
                            ''
                        }
                    </td>
                    <td class="actions">
                        <form action="/admin/toggle-visibility/${image.id}" method="post" style="display: inline;">
                            <button type="submit" class="btn ${isHidden ? 'btn-success' : 'btn-info'}">
                                ${isHidden ? 'Show' : 'Hide'}
                            </button>
                        </form>
                        <form action="/admin/delete/${image.id}" method="post" style="display: inline;">
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this image?')">
                                Delete
                            </button>
                        </form>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                ${pagination}
                
                <div class="links">
                    <a href="/admin/banned-ips">Manage Banned IPs</a>
                    <a href="/admin/sessions">Manage Sessions</a>
                    <a href="/admin/change-password">Change Password</a>
                    <a href="/admin/logout">Logout</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error generating admin panel:', error);
        res.status(500).send('Error generating admin panel');
    }
});

// Ban IP
router.post('/ban-ip/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Get IP hash for the post
        const { data: ipData, error: ipError } = await supabase
            .from('post_ips')
            .select('ip_hash')
            .eq('post_id', id)
            .single();
        
        if (ipError || !ipData) {
            return res.redirect('/admin?error=IP+not+found');
        }
        
        // Insert into banned_ips
        const { error: banError } = await supabase
            .from('banned_ips')
            .insert([{ ip_hash: ipData.ip_hash }]);
        
        if (banError) {
            // If error is duplicate key, IP is already banned
            if (banError.code === '23505') {
                return res.redirect('/admin?success=IP+already+banned');
            }
            
            console.error('Error banning IP:', banError);
            return res.redirect('/admin?error=Failed+to+ban+IP');
        }
        
        res.redirect('/admin?success=IP+banned+successfully');
    } catch (error) {
        console.error('Error banning IP:', error);
        res.redirect('/admin?error=Failed+to+ban+IP');
    }
});

// Unban IP
router.post('/unban-ip/:hash', authenticateAdmin, async (req, res) => {
    try {
        const hash = req.params.hash;
        
        // Delete from banned_ips
        const { error } = await supabase
            .from('banned_ips')
            .delete()
            .eq('ip_hash', hash);
        
        if (error) {
            console.error('Error unbanning IP:', error);
            return res.redirect('/admin/banned-ips?error=Failed+to+unban+IP');
        }
        
        res.redirect('/admin/banned-ips?success=IP+unbanned+successfully');
    } catch (error) {
        console.error('Error unbanning IP:', error);
        res.redirect('/admin/banned-ips?error=Failed+to+unban+IP');
    }
});

// Banned IPs page
router.get('/banned-ips', authenticateAdmin, async (req, res) => {
    try {
        // Get page from query params
        const page = parseInt(req.query.page) || 1;
        const perPage = 50;
        const offset = (page - 1) * perPage;
        
        // Get banned IPs with pagination
        const { data: bannedIps, error, count } = await supabase
            .from('banned_ips')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + perPage - 1);
        
        if (error) throw error;
        
        // Calculate pagination
        const totalPages = Math.ceil(count / perPage);
        let pagination = '';
        
        if (totalPages > 1) {
            pagination = '<div class="pagination">';
            
            // Previous page
            if (page > 1) {
                pagination += `<a href="/admin/banned-ips?page=${page - 1}">Previous</a>`;
            }
            
            // Page numbers
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, page + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === page) {
                    pagination += `<a href="/admin/banned-ips?page=${i}" class="active">${i}</a>`;
                } else {
                    pagination += `<a href="/admin/banned-ips?page=${i}">${i}</a>`;
                }
            }
            
            // Next page
            if (page < totalPages) {
                pagination += `<a href="/admin/banned-ips?page=${page + 1}">Next</a>`;
            }
            
            pagination += '</div>';
        }
        
        // Generate HTML for the banned IPs page
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Banned IPs - Piss and Shit Images</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    h1 {
                        color: #ff6600;
                        text-align: center;
                    }
                    .banned-ips {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #eee;
                    }
                    th {
                        background-color: #f9f9f9;
                        font-weight: bold;
                    }
                    tr:hover {
                        background-color: #f5f5f5;
                    }
                    .actions {
                        text-align: center;
                    }
                    .unban-btn {
                        background-color: #28a745;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .unban-btn:hover {
                        background-color: #218838;
                    }
                    .pagination {
                        display: flex;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .pagination a {
                        margin: 0 5px;
                        padding: 8px 12px;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        color: #333;
                        text-decoration: none;
                    }
                    .pagination a:hover {
                        background-color: #f5f5f5;
                    }
                    .pagination .active {
                        background-color: #ff6600;
                        color: white;
                        border-color: #ff6600;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        margin: 0 10px;
                        color: #0066cc;
                        text-decoration: none;
                    }
                    .links a:hover {
                        text-decoration: underline;
                    }
                    .success-message {
                        background-color: #d4edda;
                        color: #155724;
                        padding: 10px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .error-message {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 10px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .no-ips {
                        text-align: center;
                        padding: 20px;
                        font-size: 18px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <h1>Banned IPs</h1>
                
                ${req.query.success ? `<div class="success-message">${req.query.success}</div>` : ''}
                ${req.query.error ? `<div class="error-message">${req.query.error}</div>` : ''}
                
                <div class="banned-ips">
                    <table>
                        <thead>
                            <tr>
                                <th>IP Hash</th>
                                <th>Banned Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (bannedIps.length === 0) {
            html += `
                <tr>
                    <td colspan="3" class="no-ips">No banned IPs found</td>
                </tr>
            `;
        } else {
            bannedIps.forEach(ip => {
                const date = new Date(ip.created_at).toLocaleString();
                
                html += `
                    <tr>
                        <td>${ip.ip_hash}</td>
                        <td>${date}</td>
                        <td class="actions">
                            <form action="/admin/unban-ip/${ip.ip_hash}" method="post">
                                <button type="submit" class="unban-btn" onclick="return confirm('Are you sure you want to unban this IP?')">
                                    Unban
                                </button>
                            </form>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                ${pagination}
                
                <div class="links">
                    <a href="/admin">Back to Admin Panel</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error generating banned IPs page:', error);
        res.status(500).send('Error generating banned IPs page');
    }
});

// Toggle image visibility
router.post('/toggle-visibility/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Get current image data
        const { data: image, error } = await supabase
            .from('images')
            .select('mimetype')
            .eq('id', id)
            .single();
        
        if (error || !image) {
            return res.redirect('/admin?error=Image+not+found');
        }
        
        // Toggle visibility by modifying mimetype
        const isHidden = image.mimetype.includes('-hidden');
        let newMimetype;
        
        if (isHidden) {
            // Remove -hidden suffix
            newMimetype = image.mimetype.replace('-hidden', '');
        } else {
            // Add -hidden suffix
            newMimetype = `${image.mimetype}-hidden`;
        }
        
        // Update mimetype in database
        const { error: updateError } = await supabase
            .from('images')
            .update({
                mimetype: newMimetype,
                resultMessage: isHidden ? undefined : 'HIDDEN BY ADMIN (COWARD)'
            })
            .eq('id', id);
        
        if (updateError) {
            console.error('Error toggling visibility:', updateError);
            return res.redirect('/admin?error=Failed+to+toggle+visibility');
        }
        
        res.redirect('/admin?success=Image+visibility+toggled');
    } catch (error) {
        console.error('Error toggling visibility:', error);
        res.redirect('/admin?error=Failed+to+toggle+visibility');
    }
});

// Delete image
router.post('/delete/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Delete image from database
        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting image:', error);
            return res.redirect('/admin?error=Failed+to+delete+image');
        }
        
        // Also delete from post_ips
        await supabase
            .from('post_ips')
            .delete()
            .eq('post_id', id);
        
        res.redirect('/admin?success=Image+deleted+successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        res.redirect('/admin?error=Failed+to+delete+image');
    }
});

module.exports = router;