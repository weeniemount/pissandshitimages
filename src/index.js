// pissandshitimages.com

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const path = require('path');
const countryTracker = require('./middleware/countryTracker');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages', 'ejs')); // assumes /pages/image.ejs
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(process.cwd(), 'src', 'public')));
app.use(countryTracker);

app.use((req, res, next) => {
	const forbiddenParams = ['env', 'process', 'secret'];
	for (const param of forbiddenParams) {
		if (req.query[param] !== undefined) {
			return res.status(403).send('Forbidden');
		}
	}
	next();
});

// Define admin routes before the lock middleware
app.use('/', adminRouter);

if (process.env.LOCKED === 'true') {
	app.use((req, res, next) => {
		// Allow admin routes to work even when locked
		if (req.path.startsWith('/admin')) {
			return next();
		}
		res.status(403).send('down, come back later');
	});
}


// static pages
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'index.html')); });
app.get('/rules', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'rules.html')); });
app.get('/about', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'about.html')); });
app.get('/tos', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'tos.html')); });
app.get('/imagetobruh', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'imagetobruh.html')); });

// routes
const uploadRouter = require('./routes/upload.js');
const adminRouter = require('./routes/admin.js');
const leaderboardRouter = require('./routes/leaderboard.js');
const galleryRouter = require('./routes/gallery.js');
const imageRouter = require('./routes/image.js');
const sharexConfigRouter = require('./routes/sharexconfig.js');

app.use('/', uploadRouter);
app.use('/', leaderboardRouter);
app.use('/', galleryRouter);
app.use('/', imageRouter);
app.use('/', sharexConfigRouter);

app.listen(PORT, () => {
  console.log(`pissandshitimages running on http://localhost:${PORT}`);
});