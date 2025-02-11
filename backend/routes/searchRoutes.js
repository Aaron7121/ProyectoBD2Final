const express = require('express');
const router = express.Router();
const { searchArtists, searchAlbums, searchSongs } = require('../controllers/searchController');

router.get('/', async (req, res) => {
    const { query, filter } = req.query;
    try {
        let results;
        if (filter === 'artists') {
            results = await searchArtists(query);
        } else if (filter === 'albums') {
            results = await searchAlbums(query);
        } else if (filter === 'songs') {
            results = await searchSongs(query);
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;