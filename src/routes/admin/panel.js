const { supabase } = require('../../utils/db.js');
const { authenticateAdmin } = require('../../middleware/adminCheck.js');
const express = require('express');
const adminPanelRouter = express.Router();
const { getImageStats } = require('../../utils/image.js');

// Admin panel
adminPanelRouter.get('/admin', authenticateAdmin, async (req, res) => {
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

module.exports = adminPanelRouter;