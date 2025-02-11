const express = require('express');
const router = express.Router();
const { searchArtists } = require('../controllers/spotifyController');
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


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
