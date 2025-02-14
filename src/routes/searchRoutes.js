const express = require('express');
const router = express.Router();
const { searchArtists, searchAlbums, searchSongs, searchByGenre } = require('../controllers/searchController');

router.get('/', async (req, res) => {
    try {
        const { query, filter } = req.query;
        let results = [];

        switch (filter) {
            case 'artists':
                results = await searchArtists(query);
                break;
            case 'albums':
                results = await searchAlbums(query);
                break;
            case 'songs':
                results = await searchSongs(query);
                break;
            case 'genres':
                results = await searchByGenre(query);
                break;
            default:
                results = await searchArtists(query);
        }

        res.json(results);
    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
