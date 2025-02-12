// routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const { searchArtists, searchAlbums, searchSongs } = require('../controllers/searchController');

router.get('/', async (req, res) => {
    const { query, filter } = req.query;

    try {
        let results = [];
        
        // Mantener la búsqueda de artistas como estaba
        if (filter === 'artists') {
            results = await searchArtists(query);
        } 
        // Manejar la búsqueda de álbumes
        else if (filter === 'albums') {
            results = await searchAlbums(query);
        } 
        // Manejar la búsqueda de canciones
        else if (filter === 'songs') {
            results = await searchSongs(query);
        }

        res.json(results);
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({ 
            error: 'Error en la búsqueda',
            details: error.message 
        });
    }
});

module.exports = router;
