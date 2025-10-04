const { supabase } = require('../utils/db.js');
const express = require('express');
const imageRouter = express.Router();

// Serve image with OpenGraph tags
imageRouter.get('/image/:id', async (req, res) => {
	// Get both image and uploader info
	const { data: image, error: imageError } = await supabase
		.from('images')
		.select('*')
		.eq('id', req.params.id)
		.single();

	if (imageError || !image) return res.status(404).send('Image not found');

	// Get uploader info
	const { data: uploaderInfo, error: uploaderError } = await supabase
		.from('post_ips')
		.select('discord_username, discord_avatar, discord_user_id, country, created_at')
		.eq('post_id', req.params.id)
		.single();

	const imageUrl = `${req.protocol}://${req.get('host')}/raw/${image.id}`;
	const [mimetype, ...meta] = image.mimetype.split(';');
	const metaObj = Object.fromEntries(meta.map(s => s.split('=')));

	const fileSizeMB = (Buffer.from(image.data, 'base64').length / 1024 / 1024).toFixed(2);

	// Format uploader info
	const uploader = uploaderInfo ? {
		username: uploaderInfo.discord_username,
		avatar: uploaderInfo.discord_avatar ? 
			`https://cdn.discordapp.com/avatars/${uploaderInfo.discord_user_id}/${uploaderInfo.discord_avatar}.png` : 
			'https://cdn.discordapp.com/embed/avatars/0.png',
		country: uploaderInfo.country,
		uploadDate: new Date(uploaderInfo.created_at).toLocaleString()
	} : null;
	if (uploader.username === "") uploader.username = "unregistered"
	res.render('image', {
		imageUrl,
		fileSizeMB,
		shitlevel: metaObj.shitlevel?.replace('_', ' ') || 'unknown',
		roll: metaObj.roll || '??',
		date: new Date(metaObj.date).toLocaleString() || 'unknown',
		hidden: metaObj.hidden === 'true',
		message: metaObj.message || '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈',
		uploader
	});
});

// Serve raw image
imageRouter.get('/raw/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error || !data) return res.status(404).send('Image not found');
  const [mimetype] = data.mimetype.split(';');
  res.set('Content-Type', mimetype);
  res.send(Buffer.from(data.data, 'base64'));
});


module.exports = imageRouter;

