const express = require('express');
const router = express.Router();
const { searchArtists } = require('../controllers/spotifyController');

router.get('/search', searchArtists);


// Obtener todos los artistas

router.get('/', async (req, res) => {
    try {
        const { search, genre, sortBy } = req.query;
        const query = {};

        // Filtrado por nombre (si se pasa el parámetro 'search')
        if (search) query.name = { $regex: search, $options: 'i' };

        // Filtrado por género (si se pasa el parámetro 'genre')
        if (genre && genre !== 'all') query.genres = genre;

        // Opciones de ordenamiento
        const sortOptions = {};
        if (sortBy === 'popularity') {
            sortOptions.popularity = -1;  // Ordenar por popularidad descendente
        }

        const db = req.app.locals.db;

        const artists = await db.collection('artists')
            .find(query)
            .sort(sortOptions)
            .limit(10)  // Limitar el número de resultados a 10
            .toArray();

        res.json(artists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/popular', async (req, res) => {
    try {
        const artists = await db.collection('artists')
            .find()
            .sort({ popularity: -1 })
            .limit(10)
            .toArray();
        res.json(artists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
