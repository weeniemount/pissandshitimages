const { supabase } = require('../utils/db.js');
const { getHashedIP } = require('../middleware/ipCheck.js');
const { generateSessionToken, authenticateAdmin, recordLoginAttempt, isRateLimited } = require('../middleware/adminCheck.js');
const express = require('express');
const adminRouter = express.Router();
const { getImageStats } = require('../utils/image.js');
const bcrypt = require('bcrypt');

// Admin login page
adminRouter.get('/admin/login', (req, res) => {
	const error = req.query.error;
	const rateLimited = req.query.rate_limited === 'true';
	res.render('admin/login', { error, rateLimited });
});

adminRouter.post('/admin/login', async (req, res) => {
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

// Admin logout
adminRouter.get('/admin/logout', authenticateAdmin, async (req, res) => {
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

// Add session management page
adminRouter.get('/admin/sessions', authenticateAdmin, async (req, res) => {
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
adminRouter.post('/admin/revoke-session/:token', authenticateAdmin, async (req, res) => {
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

// Password change functionality
adminRouter.get('/admin/change-password', authenticateAdmin, (req, res) => {
	const error = req.query.error;
	const success = req.query.success === 'true';

	res.render('admin/change-password', { error, success });
});


adminRouter.post('/admin/change-password', authenticateAdmin, async (req, res) => {
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

// Admin panel
adminRouter.get('/admin', authenticateAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Check for success messages
  const bannedSuccess = req.query.banned === 'success';
  const deletedSuccess = req.query.deleted === 'success';
  const visibilitySuccess = req.query.visibility === 'success';

  // Get all images for stats
  const { data: allImages, error: statsError } = await supabase
    .from('images')
    .select('mimetype');

  if (statsError) return res.status(500).send('DB error: ' + statsError.message);

  const stats = await getImageStats(allImages);

  // Get paginated images without data column, but also get IP tracking info
  const { data: images, count, error } = await supabase
    .from('images')
    .select(`
      id,
      mimetype,
      post_ips(ip_hash, created_at)
    `, { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).send('DB error: ' + error.message);

  // Get banned IPs count
  const { count: bannedIPsCount } = await supabase
    .from('banned_ips')
    .select('*', { count: 'exact', head: true });

  const totalPages = Math.ceil(count / perPage);

  // Process images for template
  const processedImages = images.map(img => {
    const [mimetype, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const roll = parseFloat(metaObj.roll || '0');
    
    let shitLevel;
    if (roll >= 50) {
      shitLevel = 'LUCKY SURVIVOR';
    } else if (roll < 25) {
      shitLevel = 'EXTREME NUCLEAR';
    } else {
      shitLevel = 'NORMAL SHIT';
    }
    
    const hasIP = img.post_ips && img.post_ips.length > 0;
    const ipHash = hasIP ? img.post_ips[0].ip_hash : null;
    
    return {
      ...img,
      roll,
      shitLevel,
      shitLevelClass: roll >= 50 ? 'lucky' : roll < 25 ? 'extreme' : 'normal',
      date: new Date(metaObj.date).toLocaleString(),
      isHidden: metaObj.hidden === 'true',
      hasIP,
      ipHash: ipHash ? `${ipHash.substring(0, 8)}...` : null
    };
  });

  res.render('admin', {
    page,
    totalPages,
    from: from + 1,
    to: Math.min(to + 1, count),
    count,
    perPage,
    bannedSuccess,
    deletedSuccess,
    visibilitySuccess,
    stats,
    bannedIPsCount: bannedIPsCount || 0,
    images: processedImages
  });
});

// Add ban IP functionality to admin panel
adminRouter.post('/admin/ban-ip/:id', authenticateAdmin, async (req, res) => {
  try {
    // Get the IP hash for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', req.params.id)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).send('IP not found for this post');
    }
    
    // Add IP to banned list
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ ip_hash: postIP.ip_hash }]);
      
    if (banError) {
      // IP might already be banned
      if (banError.code === '23505') { // unique violation
        return res.status(400).send('IP is already banned');
      }
      return res.status(500).send('Error banning IP: ' + banError.message);
    }
    
    res.redirect('/admin?banned=success');
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Add unban IP functionality
adminRouter.post('/admin/unban-ip/:hash', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('banned_ips')
    .delete()
    .eq('ip_hash', req.params.hash);
    
  if (error) {
    res.status(500).send('Error unbanning IP: ' + error.message);
  } else {
    res.redirect('/admin/banned-ips');
  }
});

// Add banned IPs management page
// Updated admin routes using EJS templates
adminRouter.get('/admin/banned-ips', authenticateAdmin, async (req, res) => {
  const { data: bannedIPs, error } = await supabase
    .from('banned_ips')
    .select('*')
    .order('banned_at', { ascending: false });
    
  if (error) return res.status(500).render('admin/error', {
    title: 'Database Error',
    message: `DB error: ${error.message}`,
    backUrl: '/admin'
  });
  
  res.render('admin/banned-ips', { bannedIPs });
});

// Toggle image visibility
adminRouter.post('/admin/toggle-visibility/:id', authenticateAdmin, async (req, res) => {
  const { data: image, error: getError } = await supabase
    .from('images')
    .select('mimetype')
    .eq('id', req.params.id)
    .single();

  if (getError) {
    return res.status(500).render('admin/error', {
      title: 'Error Getting Image',
      message: `Error getting image: ${getError.message}`,
      backUrl: '/admin'
    });
  }

  const [baseMimetype, ...meta] = image.mimetype.split(';');
  const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
  const currentlyHidden = metaObj.hidden === 'true';
  
  // Toggle the hidden state
  metaObj.hidden = (!currentlyHidden).toString();
  
  // Update or add the message
  if (!currentlyHidden) {
    metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
  } else {
    delete metaObj.message;
  }

  // Reconstruct mimetype string
  const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

  const { error: updateError } = await supabase
    .from('images')
    .update({ mimetype: newMimetype })
    .eq('id', req.params.id);

  if (updateError) {
    return res.status(500).render('admin/error', {
      title: 'Error Updating Image',
      message: `Error updating image: ${updateError.message}`,
      backUrl: '/admin'
    });
  } else {
    res.redirect('/admin');
  }
});

adminRouter.post('/admin/delete/:id', authenticateAdmin, async (req, res) => {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', req.params.id);
  
  if (error) {
    return res.status(500).render('admin/error', {
      title: 'Error Deleting Image',
      message: `Error deleting image: ${error.message}`,
      backUrl: '/admin'
    });
  } else {
    res.redirect('/admin');
  }
});

// Toggle image visibility by ID (from form input)
adminRouter.post('/admin/toggle-visibility-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).render('admin/error', {
      title: 'Missing Image ID',
      message: 'Image ID is required',
      backUrl: '/admin'
    });
  }
  
  try {
    // Check if the image exists first
    const { data: image, error: getError } = await supabase
      .from('images')
      .select('mimetype')
      .eq('id', imageId)
      .single();
    
    if (getError || !image) {
      return res.status(404).render('admin/error', {
        title: 'Image Not Found',
        message: `The image with ID <strong>${imageId}</strong> was not found in the database. Please check the ID and try again.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Parse the mimetype to get metadata
    const [baseMimetype, ...meta] = image.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const currentlyHidden = metaObj.hidden === 'true';
    
    // Toggle the hidden state
    metaObj.hidden = (!currentlyHidden).toString();
    
    // Update or add the message
    if (!currentlyHidden) {
      metaObj.message = '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈';
    } else {
      delete metaObj.message;
    }

    // Reconstruct mimetype string
    const newMimetype = [baseMimetype, ...Object.entries(metaObj).map(([k, v]) => `${k}=${v}`)].join(';');

    // Update the image
    const { error: updateError } = await supabase
      .from('images')
      .update({ mimetype: newMimetype })
      .eq('id', imageId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?visibility=success');
    
  } catch (error) {
    console.error('Error toggling image visibility by ID:', error);
    res.status(500).render('admin/error', {
      title: 'Visibility Toggle Failed',
      message: `Failed to toggle visibility for image with ID <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Delete image by ID (from form input)
adminRouter.post('/admin/delete-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).render('admin/error', {
      title: 'Missing Image ID',
      message: 'Image ID is required',
      backUrl: '/admin'
    });
  }
  
  try {
    // Check if the image exists first
    const { data, error: checkError } = await supabase
      .from('images')
      .select('id')
      .eq('id', imageId)
      .single();
    
    if (checkError || !data) {
      return res.status(404).render('admin/error', {
        title: 'Image Not Found',
        message: `The image with ID <strong>${imageId}</strong> was not found in the database. Please check the ID and try again.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Delete the image
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?deleted=success');
    
  } catch (error) {
    console.error('Error deleting image by ID:', error);
    res.status(500).render('admin/error', {
      title: 'Delete Failed',
      message: `Failed to delete image with ID <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Ban IP by image ID (from form input)
adminRouter.post('/admin/ban-ip-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).render('admin/error', {
      title: 'Missing Image ID',
      message: 'Image ID is required',
      backUrl: '/admin'
    });
  }
  
  try {
    // Get the IP hash for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', imageId)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).render('admin/error', {
        title: 'IP Not Found',
        message: `No IP address was found for the image with ID <strong>${imageId}</strong>. This image may not have IP tracking information.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Add IP to banned list
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ ip_hash: postIP.ip_hash }]);
      
    if (banError) {
      // IP might already be banned
      if (banError.code === '23505') { // unique violation
        return res.status(400).render('admin/error', {
          title: 'IP Already Banned',
          message: `The IP address associated with image ID <strong>${imageId}</strong> is already banned.`,
          backUrl: '/admin',
          icon: '⚠️',
          errorType: 'warning'
        });
      }
      throw new Error(banError.message);
    }
    
    // Redirect back to admin panel with success message
    res.redirect('/admin?banned=success');
    
  } catch (error) {
    console.error('Error banning IP by image ID:', error);
    res.status(500).render('admin/error', {
      title: 'Ban Failed',
      message: `Failed to ban IP for image with ID <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Delete all images by IP from image ID (convenience function)
adminRouter.post('/admin/delete-all-by-image-ip/:imageId', authenticateAdmin, async (req, res) => {
  const { imageId } = req.params;
  
  try {
    // Get the IP hash for this image
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash')
      .eq('post_id', imageId)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).render('admin/error', {
        title: 'IP Not Found',
        message: `No IP address was found for the image with ID <strong>${imageId}</strong>. This image may not have IP tracking information.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    // Get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', postIP.ip_hash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for this IP address.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .in('id', postIds);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Try to ban the IP if not already banned (ignore if already exists)
    try {
      await supabase
        .from('banned_ips')
        .insert([{ ip_hash: postIP.ip_hash }]);
    } catch (banError) {
      // Ignore unique constraint violations (IP already banned)
      if (banError.code !== '23505') {
        console.warn('Failed to ban IP (non-critical):', banError.message);
      }
    }
    
    // Redirect back with success message
    res.redirect(`/admin?bulk_deleted=${postIds.length}&banned=success`);
    
  } catch (error) {
    console.error('Error deleting all images by image IP:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images from the same IP as image <strong>${imageId}</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Bulk delete all images by IP from form input
adminRouter.post('/admin/delete-all-by-ip-input', authenticateAdmin, async (req, res) => {
  const { ipHash } = req.body;
  
  if (!ipHash || ipHash.trim().length === 0) {
    return res.status(400).render('admin/error', {
      title: 'Missing IP Hash',
      message: 'IP hash is required. Please enter a valid IP hash.',
      backUrl: '/admin',
      icon: '❌'
    });
  }
  
  const cleanIpHash = ipHash.trim();
  
  try {
    // Get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', cleanIpHash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for the IP hash <strong>${cleanIpHash.substring(0, 8)}...</strong>. Please verify the IP hash is correct.`,
        backUrl: '/admin',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .in('id', postIds);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Try to ban the IP if not already banned (ignore if already exists)
    try {
      await supabase
        .from('banned_ips')
        .insert([{ ip_hash: cleanIpHash }]);
    } catch (banError) {
      // Ignore unique constraint violations (IP already banned)
      if (banError.code !== '23505') {
        console.warn('Failed to ban IP (non-critical):', banError.message);
      }
    }
    
    // Redirect back with success message
    res.redirect(`/admin?bulk_deleted=${postIds.length}&banned=success`);
    
  } catch (error) {
    console.error('Error bulk deleting images by IP input:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images for IP hash <strong>${cleanIpHash.substring(0, 8)}...</strong>. Error: ${error.message}`,
      backUrl: '/admin',
      icon: '❌'
    });
  }
});

// Delete all images by IP hash  
adminRouter.post('/admin/delete-all-by-ip/:ipHash', authenticateAdmin, async (req, res) => {
  const { ipHash } = req.params;
  
  if (!ipHash) {
    return res.status(400).render('admin/error', {
      title: 'Missing IP Hash',
      message: 'IP hash is required',
      backUrl: '/admin/banned-ips'
    });
  }
  
  try {
    // First, get all post IDs for this IP
    const { data: postIPs, error: getPostsError } = await supabase
      .from('post_ips')
      .select('post_id')
      .eq('ip_hash', ipHash);
    
    if (getPostsError) {
      throw new Error(getPostsError.message);
    }
    
    if (!postIPs || postIPs.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'No Images Found',
        message: `No images were found for the IP hash <strong>${ipHash.substring(0, 8)}...</strong>`,
        backUrl: '/admin/banned-ips',
        icon: '❌'
      });
    }
    
    const postIds = postIPs.map(p => p.post_id);
    
    // Delete all images with these IDs
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .in('id', postIds);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Redirect back with success message
    res.redirect(`/admin/banned-ips?deleted_count=${postIds.length}&deleted_ip=${ipHash.substring(0, 8)}`);
    
  } catch (error) {
    console.error('Error deleting all images by IP:', error);
    res.status(500).render('admin/error', {
      title: 'Bulk Delete Failed',
      message: `Failed to delete all images for IP hash <strong>${ipHash.substring(0, 8)}...</strong>. Error: ${error.message}`,
      backUrl: '/admin/banned-ips',
      icon: '❌'
    });
  }
});

// Admin logout
adminRouter.get('/admin/logout', (req, res) => {
  res.clearCookie('adminAuth');
  res.redirect('/admin/login');
});

module.exports = adminRouter;