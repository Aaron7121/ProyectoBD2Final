const express = require('express');
const router = express.Router();
const { searchArtists } = require('../controllers/spotifyController');
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Obtener todos los artistas

router.get('/', async (req, res) => {
    try {
        const { sort, limit } = req.query;
        const db = req.app.locals.db;
        
        let query = {};
        let sortOptions = {};
        
        if (sort === 'popularity') {
            sortOptions = { popularity: -1 };
        }

        const artists = await db.collection('artists')
            .find(query)
            .sort(sortOptions)
            .limit(parseInt(limit) || 10)
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

router.get('/:artistId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('ProyectoDB2');

        // Obtener artista
        const artist = await db.collection('artists').findOne(
            { _id: new ObjectId(req.params.artistId) }
        );

        // Obtener álbumes del artista
        const albums = await db.collection('albums')
            .find({ _id: { $in: artist.albums.map(id => new ObjectId(id)) } })
            .toArray();

        res.json({ artist, albums });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener canciones de un álbum
router.get('/:artistId/album/:albumId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('ProyectoDB2');

        const album = await db.collection('albums').findOne(
            { _id: new ObjectId(req.params.albumId) }
        );

        const songs = await db.collection('songs')
            .find({ _id: { $in: album.songs.map(id => new ObjectId(id)) } })
            .toArray();

        res.json({ album, songs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
