const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const { year, sort, limit } = req.query;
        const db = req.app.locals.db;
        
        let query = {};
        if (year) {
            // Crear rango de fechas para el año especificado
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            query.releaseDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        let sortOptions = {};
        if (sort === 'releaseDate') {
            sortOptions.releaseDate = -1;
        }

        const albums = await db.collection('albums')
            .find(query)
            .sort(sortOptions)
            .limit(parseInt(limit) || 10)
            .toArray();

        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Nuevo endpoint para obtener un álbum específico y sus canciones
router.get('/:albumId', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const album = await db.collection('albums').findOne(
            { _id: new ObjectId(req.params.albumId) }
        );

        if (!album) {
            return res.status(404).json({ message: 'Álbum no encontrado' });
        }

        // Obtener las canciones del álbum
        const songs = await db.collection('songs')
            .find({ _id: { $in: album.songs.map(id => new ObjectId(id)) } })
            .toArray();

        res.json({ album, songs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

