const { supabase } = require('../utils/db.js');
const express = require('express');
const galleryRouter = express.Router();
const { parseImageMetadata } = require('../utils/image.js');

// Gallery page with sorting capabilities
galleryRouter.get('/gallery', async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const from = (page - 1) * perPage;
	const bufferSize = Math.ceil(perPage * 1.5);
	const to = from + bufferSize - 1;
	
	// Get sorting parameters
	const sortBy = req.query.sort || 'id'; // id, date, roll_best, roll_worst
	const order = req.query.order || 'desc'; // asc, desc
	const searchId = req.query.search_id || '';

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

	// Build base query
	let query = supabase
		.from('images')
		.select('id,mimetype');

	// Apply ID search filter if provided
	if (searchId) {
		query = query.ilike('id', `%${searchId}%`);
	}

	// Apply sorting - we'll need to sort after fetching due to metadata in mimetype
	const { data: rawImages, error } = await query
		.order('id', { ascending: false }) // Default ordering, we'll sort later
		.range(0, 1000); // Get more data for proper sorting

	if (error) return res.status(500).send('DB error: ' + error.message);

	// Filter visible images and add metadata
	const processedImages = (rawImages || [])
		.map(parseImageMetadata)
		.filter(img => !img.hidden); // Only visible images

	// Apply sorting
	processedImages.sort((a, b) => {
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

	const totalVisibleImages = processedImages.length;
	const totalPages = Math.ceil(totalVisibleImages / perPage);

	// Get current page of images
	const paginatedImages = processedImages.slice((page - 1) * perPage, page * perPage);

	const galleryItems = paginatedImages.map(img => {
		let shitLevel = 'NORMAL SHIT';
		if (img.roll >= 50) shitLevel = 'LUCKY SURVIVOR';
		else if (img.roll < 25) shitLevel = 'EXTREME NUCLEAR';

		return `
			<div class="image-card">
				<div class="image-wrapper">
					<a href="/image/${img.id}">
						<img src="/raw/${img.id}" alt="Shitified image" />
					</a>
				</div>
				<div class="info">
					<div class="image-id">🆔 ID: ${img.id}</div>
					<div class="shitification ${img.roll >= 50 ? 'lucky-survivor' : ''}">
						${img.roll >= 50 ? '✨' : '🎲'} ${shitLevel} (${img.roll.toFixed(2)}%)
					</div>
					<div class="date">
						📅 ${img.date.toLocaleString()}
					</div>
				</div>
			</div>
		`;
	}).join('');

	const generatePagination = () => {
		const baseUrl = `/gallery?sort=${sortBy}&order=${order}${searchId ? `&search_id=${encodeURIComponent(searchId)}` : ''}`;
		let html = '';
		
		if (page > 1) {
			html += `<a href="${baseUrl}&page=${page - 1}" class="prev-next">⬅️ Previous</a>`;
		} else {
			html += `<span class="prev-next disabled">⬅️ Previous</span>`;
		}

		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(totalPages, page + 2);

		if (startPage > 1) {
			html += `<a href="${baseUrl}&page=1">1</a>`;
			if (startPage > 2) html += `<span class="ellipsis">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			html += i === page
				? `<span class="current">${i}</span>`
				: `<a href="${baseUrl}&page=${i}">${i}</a>`;
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
			html += `<a href="${baseUrl}&page=${totalPages}">${totalPages}</a>`;
		}

		if (page < totalPages) {
			html += `<a href="${baseUrl}&page=${page + 1}" class="prev-next">Next ➡️</a>`;
		} else {
			html += `<span class="prev-next disabled">Next ➡️</span>`;
		}

		return html;
	};

	// Generate sort options
	const sortOptions = [
		{ value: 'id', label: '🆔 ID' },
		{ value: 'date', label: '📅 Date' },
		{ value: 'roll_best', label: '🏆 Best Rolls' },
		{ value: 'roll_worst', label: '💀 Worst Rolls' }
	];

	res.render('gallery', {
		page,
		perPage,
		totalPages,
		totalVisibleImages,
		visibleImages: paginatedImages,
		stats,
		galleryItems,
		pagination: generatePagination(),
		sortBy,
		order,
		searchId,
		sortOptions,
		user: req.user
	});
});

module.exports = galleryRouter;