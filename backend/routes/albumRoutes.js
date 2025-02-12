const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const albums = await db.collection('albums').find().limit(10).toArray();
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