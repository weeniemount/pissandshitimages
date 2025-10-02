const { supabase } = require('../utils/db.js');
const express = require('express');
const apiRouter = express.Router();

// GET /api/randomimage - Returns a random image
apiRouter.get('/randomimage', async (req, res) => {
  try {
    const raw = req.query.raw === 'true';

    const { data: imageIds, error: idsError } = await supabase
      .from('images')
      .select('id')
      .limit(100);

    if (idsError) {
      console.error('Supabase error:', idsError);
      return res.status(500).json({ error: 'Database error', details: idsError.message });
    }

    if (!imageIds || imageIds.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    // Pick random ID
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)].id;

    // Now fetch the full image data only for that one image
    const { data: randomImage, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('id', randomId)
      .single();

    if (imageError || !randomImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If raw, just return the image
    if (raw) {
      const [mimetype] = randomImage.mimetype.split(';');
      res.set('Content-Type', mimetype);
      return res.send(Buffer.from(randomImage.data, 'base64'));
    }

    // Otherwise, get uploader info and return JSON
    const { data: uploaderInfo } = await supabase
      .from('post_ips')
      .select('discord_username, discord_avatar, discord_user_id, created_at')
      .eq('post_id', randomImage.id)
      .single();

    const response = {
      id: randomImage.id,
      image: randomImage.data,
      mimetype: randomImage.mimetype.split(';')[0],
      created_at: randomImage.created_at,
      uploader: uploaderInfo ? {
        username: uploaderInfo.discord_username || 'Anonymous',
        avatar: uploaderInfo.discord_avatar ? 
          `https://cdn.discordapp.com/avatars/${uploaderInfo.discord_user_id}/${uploaderInfo.discord_avatar}.png` : 
          null,
        uploaded_at: uploaderInfo.created_at
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching random image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/image - Returns specific image by ID
apiRouter.get('/image', async (req, res) => {
  try {
    const imageId = req.query.id;
    const raw = req.query.raw === 'true';

    if (!imageId) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }

    // Get the specific image
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (imageError || !image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If raw, just return the image
    if (raw) {
      const [mimetype] = image.mimetype.split(';');
      res.set('Content-Type', mimetype);
      return res.send(Buffer.from(image.data, 'base64'));
    }

    // Otherwise, get uploader info and return JSON
    const { data: uploaderInfo } = await supabase
      .from('post_ips')
      .select('discord_username, discord_avatar, discord_user_id, created_at')
      .eq('post_id', image.id)
      .single();

    const response = {
      id: image.id,
      image: image.data,
      mimetype: image.mimetype.split(';')[0],
      created_at: image.created_at,
      uploader: uploaderInfo ? {
        username: uploaderInfo.discord_username || 'Anonymous',
        avatar: uploaderInfo.discord_avatar ? 
          `https://cdn.discordapp.com/avatars/${uploaderInfo.discord_user_id}/${uploaderInfo.discord_avatar}.png` : 
          null,
        uploaded_at: uploaderInfo.created_at
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = apiRouter;