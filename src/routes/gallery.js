const { supabase } = require('../utils/db.js');
const express = require('express');
const galleryRouter = express.Router();

// Gallery page
galleryRouter.get('/gallery', async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const from = (page - 1) * perPage;
	const bufferSize = Math.ceil(perPage * 1.5);
	const to = from + bufferSize - 1;

	// Get all mimetypes for stats
	const { data: allImages, error: statsError } = await supabase
		.from('images')
		.select('mimetype');

	if (statsError) return res.status(500).send('DB error: ' + statsError.message);

	const getImageStats = async (images) => {
		let stats = {
			total: images.length,
			visible: 0,
			hidden: 0,
			luckySurvivor: 0,
			normalShit: 0,
			extremeNuclear: 0,
			totalSize: 0
		};

		for (const img of images) {
			const [_, ...meta] = img.mimetype.split(';');
			const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
			const roll = parseFloat(metaObj.roll || '0');
			const hidden = metaObj.hidden === 'true';

			if (hidden) {
				stats.hidden++;
				continue;
			}

			stats.visible++;
			stats.totalSize += parseInt(metaObj.size || '0');

			if (roll >= 50) stats.luckySurvivor++;
			else if (roll < 25) stats.extremeNuclear++;
			else stats.normalShit++;
		}

		return stats;
	};

	const stats = await getImageStats(allImages);

	// Count visible images
	const visibleImagesForCount = allImages.filter(img => {
		const [_, ...meta] = img.mimetype.split(';');
		const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
		return metaObj.hidden !== 'true';
	});

	const totalVisibleImages = visibleImagesForCount.length;
	const totalPages = Math.ceil(totalVisibleImages / perPage);

	// Get paginated image data (w/ buffer)
	const { data: rawImages, error } = await supabase
		.from('images')
		.select('id,mimetype')
		.order('id', { ascending: false })
		.range(from, to);

	if (error) return res.status(500).send('DB error: ' + error.message);

	// Filter and process visible images
	const visibleImages = (rawImages || [])
		.filter(img => {
			const [_, ...meta] = img.mimetype.split(';');
			const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
			return metaObj.hidden !== 'true';
		})
		.slice(0, perPage);

	const galleryItems = visibleImages.map(img => {
		const [mimetype, ...meta] = img.mimetype.split(';');
		const metaObj = Object.fromEntries(meta.map(s => s.split('=')));
		const roll = parseFloat(metaObj.roll || '0');
		let shitLevel = 'NORMAL SHIT';
		if (roll >= 50) shitLevel = 'LUCKY SURVIVOR';
		else if (roll < 25) shitLevel = 'EXTREME NUCLEAR';

		return `
			<div class="image-card">
				<div class="image-wrapper">
					<a href="/image/${img.id}">
						<img src="/raw/${img.id}" alt="Shitified image" />
					</a>
				</div>
				<div class="info">
					<div class="shitification ${roll >= 50 ? 'lucky-survivor' : ''}">
						${roll >= 50 ? '✨' : '🎲'} ${shitLevel} (${roll.toFixed(2)}%)
					</div>
					<div class="date">
						📅 ${new Date(metaObj.date).toLocaleString() || 'unknown'}
					</div>
				</div>
			</div>
		`;
	}).join('');

	const generatePagination = () => {
		let html = '';
		if (page > 1) {
			html += `<a href="/gallery?page=${page - 1}" class="prev-next">⬅️ Previous</a>`;
		} else {
			html += `<span class="prev-next disabled">⬅️ Previous</span>`;
		}

		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(totalPages, page + 2);

		if (startPage > 1) {
			html += `<a href="/gallery?page=1">1</a>`;
			if (startPage > 2) html += `<span class="ellipsis">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			html += i === page
				? `<span class="current">${i}</span>`
				: `<a href="/gallery?page=${i}">${i}</a>`;
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
			html += `<a href="/gallery?page=${totalPages}">${totalPages}</a>`;
		}

		if (page < totalPages) {
			html += `<a href="/gallery?page=${page + 1}" class="prev-next">Next ➡️</a>`;
		} else {
			html += `<span class="prev-next disabled">Next ➡️</span>`;
		}

		return html;
	};

	res.render('gallery', {
		page,
		perPage,
		totalPages,
		totalVisibleImages,
		visibleImages,
		stats,
		galleryItems,
		pagination: generatePagination()
	});
});

module.exports = galleryRouter;