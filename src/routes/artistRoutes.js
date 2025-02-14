const express = require('express');
const router = express.Router();
const conexion = require('../config/db'); // Añadir esta importación
const { searchSpotifyArtist, getArtistAlbums, getAlbumTracks } = require('../services/spotifyService');
const { getLyrics } = require('../services/geniusService');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const mongoose = require('mongoose'); // Añadir esta importación
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const { processLyricsInBackground, lyricsEmitter } = require('../services/lyricsService'); // Añadir esta importación

// Ruta de verificación
router.get('/check', async (req, res) => {
    try {
        const { name } = req.query;
        const artist = await Artist.findOne({
            name: { $regex: new RegExp(name, 'i') }
        });
        res.json({ exists: !!artist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modificar la ruta para añadir un nuevo artista
router.post('/add', async (req, res) => {
    try {
        const { artistName } = req.body;
        await conexion();

        // Verificar si el artista ya existe
        const existingArtist = await Artist.findOne({
            name: { $regex: new RegExp(`^${artistName}$`, 'i') }
        });

        if (existingArtist) {
            return res.status(400).json({
                message: 'El artista ya existe en la base de datos',
                artistId: existingArtist._id
            });
        }

        // Si no existe, obtener info de Spotify y crear
        const artistInfo = await searchSpotifyArtist(artistName);
        if (!artistInfo) {
            return res.status(404).json({ message: 'Artista no encontrado en Spotify' });
        }

        // Crear el artista
        const artist = new Artist({
            name: artistInfo.name,
            image: artistInfo.images[0]?.url || '',
            followers: artistInfo.followers,
            genres: artistInfo.genres,
            popularity: artistInfo.popularity,
            url: artistInfo.external_urls.spotify,
            albums: []
        });

        // Obtener y crear álbumes
        const albums = await getArtistAlbums(artistInfo.id);
        const albumIds = [];

        for (const albumData of albums) {
            const album = new Album({
                name: albumData.name,
                image: albumData.images[0]?.url || '',
                releaseDate: albumData.release_date,
                totalTracks: albumData.total_tracks
            });

            const tracks = await getAlbumTracks(albumData.id);
            const songIds = [];

            for (const trackData of tracks) {
                const song = new Song({
                    title: trackData.name,
                    duration: trackData.duration_ms,
                    url: trackData.external_urls.spotify,
                    album: album._id,
                    artists: [artist._id]
                });

                await song.save();
                songIds.push(song._id);
            }

            album.songs = songIds;
            await album.save();
            albumIds.push(album._id);
        }

        artist.albums = albumIds;
        await artist.save();

        // Después de guardar el artista, iniciar el proceso de letras en segundo plano
        // pero no esperar a que termine
        processLyricsInBackground(artist._id).catch(error => {
            console.error('Error en proceso de letras:', error);
        });

        // Responder inmediatamente con los datos del artista
        res.json({
            message: 'Artista añadido exitosamente',
            artistId: artist._id,
            artist: {
                name: artist.name,
                image: artist.image,
                followers: artist.followers.total,
                genres: artist.genres,
                popularity: artist.popularity,
                url: artist.url,
                albums: artist.albums
            }
        });

    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ 
            message: 'Error al añadir el artista',
            error: error.message
        });
    }
});

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

// Modificar la ruta para obtener artista por ID
router.get('/:artistId', async (req, res) => {
    try {
        await conexion();
        
        if (!mongoose.Types.ObjectId.isValid(req.params.artistId)) {
            return res.status(400).json({ message: 'ID de artista inválido' });
        }

        const artist = await Artist.findById(req.params.artistId)
            .populate('albums');

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        res.json({ artist, albums: artist.albums });
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

// Modificar la ruta de búsqueda
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        
        const artist = await Artist.findOne({
            name: { $regex: new RegExp(name, 'i') }
        }).populate('albums');

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        res.json(artist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modificar la ruta de procesamiento de letras
router.post('/:artistId/lyrics', async (req, res) => {
    try {
        await conexion();
        const artist = await Artist.findById(req.params.artistId).populate({
            path: 'albums',
            populate: { path: 'songs' }
        });

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        // Iniciar proceso de letras en segundo plano
        processLyricsInBackground(artist);

        res.json({ 
            message: 'Procesamiento de letras iniciado en segundo plano',
            artistId: artist._id 
        });
    } catch (error) {
        console.error('Error al iniciar procesamiento de letras:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
