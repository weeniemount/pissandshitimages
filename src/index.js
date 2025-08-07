// pissandshitimages.com

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path')
const { supabase } = require('./db.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages', 'views')); // assumes /pages/image.ejs

app.use(express.static(path.join(process.cwd(), 'src', 'public')));

if (process.env.LOCKED === 'true') {
	app.use((req, res) => {
		res.status(403).send('down, come back later');
	});
}

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// ShareX Config download
app.get('/sharexconfig', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const config = {
    "Version": "14.1.0",
    "Name": "pissandshitimages",
    "DestinationType": "ImageUploader",
    "RequestMethod": "POST",
    "RequestURL": `https://${req.get('host')}/upload`,
    "Body": "MultipartFormData",
    "FileFormName": "image",
    "Arguments": {
      "hide": "on"
    },
    "ResponseType": "RedirectionURL",
    "URL": "{responseurl}"
  };
  
  res.setHeader('Content-Disposition', 'attachment; filename="pissandshitimages.sxcu"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(config, null, 2));
});

// static pages
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'index.html')); });
app.get('/rules', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'rules.html')); });
app.get('/about', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'about.html')); });
app.get('/tos', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'tos.html')); });

// routes
const uploadRouter = require('./routes/upload.js');
const adminRouter = require('./routes/admin.js');
const leaderboardRouter = require('./routes/leaderboard.js');
const galleryRouter = require('./routes/gallery.js');
const imageRouter = require('./routes/image.js');

app.use('/', adminRouter);
app.use('/', uploadRouter);
app.use('/', leaderboardRouter);
app.use('/', galleryRouter);
app.use('/', imageRouter);

app.use((req, res, next) => {
	const forbiddenParams = ['env', 'process', 'secret'];
	for (const param of forbiddenParams) {
		if (req.query[param] !== undefined) {
			return res.status(403).send('Forbidden');
		}
	}
	next();
});

app.listen(PORT, () => {
  console.log(`pissandshitimages running on http://localhost:${PORT}`);
});