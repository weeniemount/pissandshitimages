const { supabase } = require('../utils/db.js');
const express = require('express');
const imageRouter = express.Router();

// Serve image with OpenGraph tags
imageRouter.get('/image/:id', async (req, res) => {
	const { data, error } = await supabase
		.from('images')
		.select('*')
		.eq('id', req.params.id)
		.single();

	if (error || !data) return res.status(404).send('Image not found');

	const imageUrl = `${req.protocol}://${req.get('host')}/raw/${data.id}`;
	const [mimetype, ...meta] = data.mimetype.split(';');
	const metaObj = Object.fromEntries(meta.map(s => s.split('=')));

	const fileSizeMB = (Buffer.from(data.data, 'base64').length / 1024 / 1024).toFixed(2);

	res.render('image', {
		imageUrl,
		fileSizeMB,
		shitlevel: metaObj.shitlevel?.replace('_', ' ') || 'unknown',
		roll: metaObj.roll || '??',
		date: new Date(metaObj.date).toLocaleString() || 'unknown',
		hidden: metaObj.hidden === 'true',
		message: metaObj.message || '🙈 THIS USER IS A COWARD WHO TRIED TO HIDE THEIR SHAME! 🙈'
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