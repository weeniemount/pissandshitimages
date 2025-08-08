const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminPanelRouter = express.Router();
const { getImageStats } = require('../../utils/image.js');

// Admin panel with sorting capabilities
adminPanelRouter.get('/admin', authenticateAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  
  // Get sorting parameters
  const sortBy = req.query.sort || 'id'; // id, date, roll_best, roll_worst
  const order = req.query.order || 'desc'; // asc, desc
  const searchId = req.query.search_id || '';
  const showHidden = req.query.show_hidden === 'true';
  
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
  
  // Build base query - get more data for proper sorting
  let query = supabase
    .from('images')
    .select(`
      id,
      mimetype,
      post_ips(ip_hash, created_at)
    `);
  
  // Apply ID search filter if provided
  if (searchId) {
    query = query.ilike('id', `%${searchId}%`);
  }
  
  const { data: rawImages, error } = await query
    .order('id', { ascending: false }) // Default ordering, we'll sort later
    .limit(1000); // Get more data for proper sorting
  
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  // Get banned IPs count
  const { count: bannedIPsCount } = await supabase
    .from('banned_ips')
    .select('*', { count: 'exact', head: true });
  
  // Process images and add metadata
  const processedImages = (rawImages || []).map(img => {
    const [mimetype, ...meta] = img.mimetype.split(';');
    const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
    const roll = parseFloat(metaObj.roll || '0');
    const date = new Date(metaObj.date || Date.now());
    const isHidden = metaObj.hidden === 'true';
    
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
      date,
      isHidden,
      shitLevel,
      shitLevelClass: roll >= 50 ? 'lucky' : roll < 25 ? 'extreme' : 'normal',
      hasIP,
      ipHash: ipHash ? `${ipHash.substring(0, 8)}...` : null,
      metaObj
    };
  });
  
  // Filter by visibility if needed
  let filteredImages = processedImages;
  if (!showHidden) {
    filteredImages = processedImages.filter(img => !img.isHidden);
  }
  
  // Apply sorting
  filteredImages.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'id':
        comparison = parseInt(a.id) - parseInt(b.id);
        break;
      case 'date':
        comparison = a.date.getTime() - b.date.getTime();
        break;
      case 'roll_best':
        comparison = b.roll - a.roll; // Best rolls first (descending)
        break;
      case 'roll_worst':
        comparison = a.roll - b.roll; // Worst rolls first (ascending)
        break;
      default:
        comparison = parseInt(b.id) - parseInt(a.id); // Default: newest first
    }
    
    // Apply order (except for roll_best/roll_worst which have inherent order)
    if (sortBy !== 'roll_best' && sortBy !== 'roll_worst') {
      return order === 'asc' ? comparison : -comparison;
    }
    return comparison;
  });
  
  const totalImages = filteredImages.length;
  const totalPages = Math.ceil(totalImages / perPage);
  
  // Get current page of images
  const from = (page - 1) * perPage;
  const to = Math.min(from + perPage, totalImages);
  const paginatedImages = filteredImages.slice(from, to);
  
  // Format dates for display
  const finalImages = paginatedImages.map(img => ({
    ...img,
    date: img.date.toLocaleString()
  }));
  
  // Generate sort options
  const sortOptions = [
    { value: 'id', label: '🆔 ID' },
    { value: 'date', label: '📅 Date' },
    { value: 'roll_best', label: '🏆 Best Rolls' },
    { value: 'roll_worst', label: '💀 Worst Rolls' }
  ];
  
  res.render('admin', {
    page,
    totalPages,
    from: from + 1,
    to: to,
    count: totalImages,
    perPage,
    bannedSuccess,
    deletedSuccess,
    visibilitySuccess,
    stats,
    bannedIPsCount: bannedIPsCount || 0,
    images: finalImages,
    sortBy,
    order,
    searchId,
    showHidden,
    sortOptions,
    query: req.query
  });
});

module.exports = adminPanelRouter;