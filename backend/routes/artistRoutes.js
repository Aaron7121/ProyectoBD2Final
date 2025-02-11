const express = require('express');
const router = express.Router();

// Obtener todos los artistas

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const artists = await db.collection('artists').find().limit(10).toArray();
        res.json(artists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

router.get('/', async (req, res) => {
    try {
        const { search, genre, sortBy } = req.query;
        const query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (genre && genre !== 'all') query.genres = genre;

        const sortOptions = {};
        if (sortBy === 'popularity') sortOptions.popularity = -1;

        const db = req.app.locals.db;

        const artists = await db.collection('artists')
            .find(query)
            .sort(sortOptions)
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


