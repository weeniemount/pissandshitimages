// pissandshitimages.com

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const countryTracker = require('./middleware/countryTracker');
const { passport } = require('./middleware/discordAuth');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages', 'ejs')); // assumes /pages/image.ejs
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(process.cwd(), 'src', 'public')));
app.use(countryTracker);

// Session and auth setup
const sessionMiddleware = require('./utils/session');
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', 1)

app.use((req, res, next) => {
	const forbiddenParams = ['env', 'process', 'secret'];
	for (const param of forbiddenParams) {
		if (req.query[param] !== undefined) {
			return res.status(403).send('Forbidden');
		}
	}
	next();
});

const adminRouter = require('./routes/admin.js');
const authRouter = require('./routes/auth.js');
// Define admin and auth routes before the lock middleware
app.use('/', adminRouter);
app.use('/', authRouter);

if (process.env.LOCKED === 'true') {
	app.use((req, res, next) => {
		// Allow admin routes and image viewing to work even when locked
		if (req.path.startsWith('/admin') || 
			req.path.startsWith('/i/') || 
			req.path === '/image') {
			return next();
		}
		res.status(503).sendFile(path.join(__dirname, 'pages', 'sitedown.html'));
	});
}


// static pages
app.get('/', (req, res) => { 
    res.render('index', { user: req.user }); 
});
app.get('/rules', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'rules.html')); });
app.get('/about', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'about.html')); });
app.get('/tos', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'tos.html')); });
app.get('/imagetobruh', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'imagetobruh.html')); });

// routes
const uploadRouter = require('./routes/upload.js');
const leaderboardRouter = require('./routes/leaderboard.js');
const galleryRouter = require('./routes/gallery.js');
const imageRouter = require('./routes/image.js');
const sharexConfigRouter = require('./routes/sharexconfig.js');

app.use('/', uploadRouter);
app.use('/', leaderboardRouter);
app.use('/', galleryRouter);
app.use('/', imageRouter);
app.use('/', sharexConfigRouter);

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
});

app.listen(PORT, () => {
  console.log(`pissandshitimages running on http://localhost:${PORT}`);
});