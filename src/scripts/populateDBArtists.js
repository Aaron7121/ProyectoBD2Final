const mongoose = require('mongoose');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const { getSpotifyToken, searchSpotifyArtist, getArtistAlbums, getAlbumTracks } = require('../services/spotifyService');
const conexion = require('../config/db');

const populateDB = async (artistName) => {
    try {
        await conexion();

        // Buscar el artista en Spotify
        const artistInfo = await searchSpotifyArtist(artistName);

        if (!artistInfo) {
            throw new Error(`No se encontró el artista "${artistName}" en Spotify.`);
        }

        // Verificar si el artista ya existe
        const existingArtist = await Artist.findOne({ name: artistInfo.name });
        if (existingArtist) {
            throw new Error(`El artista "${artistInfo.name}" ya existe en la base de datos.`);
        }

        // Crear el nuevo artista
        const artist = new Artist({
            name: artistInfo.name,
            image: artistInfo.images[0]?.url || '',
            followers: artistInfo.followers,
            genres: artistInfo.genres,
            popularity: artistInfo.popularity,
            url: artistInfo.external_urls.spotify,
            albums: []
        });

        // Obtener álbumes
        const albums = await getArtistAlbums(artistInfo.id, artistInfo.name);
        const artistAlbums = [];

        for (const albumData of albums) {
            const album = new Album({
                name: albumData.name,
                image: albumData.images[0]?.url || '',
                releaseDate: albumData.release_date,
                totalTracks: albumData.total_tracks,
            });

            const tracks = await getAlbumTracks(albumData.id);
            const albumSongs = [];

            for (const trackData of tracks) {
                const song = new Song({
                    title: trackData.name,
                    duration: trackData.duration_ms,
                    url: trackData.external_urls.spotify,
                    album: album._id,
                    artists: [artist._id],
                });

                await song.save();
                albumSongs.push(song._id);
            }

            album.songs = albumSongs;
            await album.save();
            artistAlbums.push(album._id);
        }

        artist.albums = artistAlbums;
        await artist.save();

        return artist;
    } catch (error) {
        console.error('Error en populateDB:', error);
        throw error;
    }
};

module.exports = { populateDB };