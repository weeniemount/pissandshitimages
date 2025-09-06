const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminIpBanRouter = express.Router();

// Add ban IP functionality to admin panel
adminIpBanRouter.post('/admin/ban-ip/:id', authenticateAdmin, async (req, res) => {
  try {
    // Get the IP hash and country for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash, country')
      .eq('post_id', req.params.id)
      .single();
      
    if (getIPError || !postIP) {
      return res.status(404).send('IP not found for this post');
    }
    
    // Add IP to banned list - store the actual IP, not the hash
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ 
        ip_hash: postIP.ip_hash.length === 64 ? postIP.ip_hash : postIP.ip_hash // Keep hash if it's legacy, otherwise store plain IP
      }]);
      
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
adminIpBanRouter.post('/admin/unban-ip/:hash', authenticateAdmin, async (req, res) => {
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
adminIpBanRouter.get('/admin/banned-ips', authenticateAdmin, async (req, res) => {
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

// Ban IP by image ID (from form input)
adminIpBanRouter.post('/admin/ban-ip-by-id', authenticateAdmin, async (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).render('admin/error', {
      title: 'Missing Image ID',
      message: 'Image ID is required',
      backUrl: '/admin'
    });
  }
  
  try {
    // Get the IP hash and country for this post
    const { data: postIP, error: getIPError } = await supabase
      .from('post_ips')
      .select('ip_hash, country')
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
    
    // Add IP to banned list with country info
    const { error: banError } = await supabase
      .from('banned_ips')
      .insert([{ 
        ip_hash: postIP.ip_hash,
        country: postIP.country || 'Unknown'
      }]);
      
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

module.exports = adminIpBanRouter;