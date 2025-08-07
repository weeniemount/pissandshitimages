const { supabase } = require('../db.js');
const express = require('express');
const leaderboardRouter = express.Router();

// Leaderboard page
leaderboardRouter.get('/leaderboard', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  
  // First, get all images for stats (metadata only)
  const { data, error } = await supabase
    .from('images')
    .select('id,mimetype')
    .order('id', { ascending: false });
    
  if (error) return res.status(500).send('DB error: ' + error.message);
  
  // Filter out hidden images and parse roll percentages
  const visibleImages = (data || [])
    .filter(img => {
      const [_, ...meta] = img.mimetype.split(';');
      const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
      return metaObj.hidden !== 'true';
    })
    .map(img => {
      const [_, ...meta] = img.mimetype.split(';');
      const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
      const roll = parseFloat(metaObj.roll || '0');
      let shitlevel;
      if (roll >= 50) {
        shitlevel = 'LUCKY SURVIVOR';
      } else if (roll < 25) {
        shitlevel = 'EXTREME NUCLEAR';
      } else {
        shitlevel = 'NORMAL SHIT';
      }
      return {
        id: img.id,
        roll: roll,
        shitlevel: shitlevel,
        date: new Date(metaObj.date || Date.now()).toLocaleString()
      };
    })
    .sort((a, b) => b.roll - a.roll); // Sort by roll percentage, highest first
    
  // Calculate pagination values
  const totalImages = visibleImages.length;
  const totalPages = Math.ceil(totalImages / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  // Get the images for the current page
  const rankedImages = visibleImages.slice(startIndex, endIndex);
  
  // Calculate the global rank for each image on the current page
  const rankedImagesWithGlobalRank = rankedImages.map((img, index) => {
    const globalRank = startIndex + index + 1; // +1 because ranks start at 1, not 0
    return { ...img, globalRank };
  });

  // Generate pagination data
  const generatePaginationData = () => {
    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      pages: []
    };

    // Page range around current page
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    // First page and ellipsis if needed
    if (startPage > 1) {
      pagination.pages.push({ number: 1, isCurrent: false, isEllipsis: false });
      if (startPage > 2) {
        pagination.pages.push({ isEllipsis: true });
      }
    }

    // Page range around current page
    for (let i = startPage; i <= endPage; i++) {
      pagination.pages.push({ 
        number: i, 
        isCurrent: i === page, 
        isEllipsis: false 
      });
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pagination.pages.push({ isEllipsis: true });
      }
      pagination.pages.push({ 
        number: totalPages, 
        isCurrent: false, 
        isEllipsis: false 
      });
    }

    return pagination;
  };

  const paginationData = generatePaginationData();

  // Render the EJS template
  res.render('leaderboard', {
    title: 'Leaderboard - pissandshitimages',
    images: rankedImagesWithGlobalRank,
    pagination: paginationData,
    pageInfo: {
      start: startIndex + 1,
      end: Math.min(startIndex + rankedImages.length, totalImages),
      total: totalImages
    }
  });
});

module.exports = leaderboardRouter;