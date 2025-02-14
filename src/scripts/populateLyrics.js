const mongoose = require('mongoose');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const { getLyrics } = require('../services/geniusService');
const conexion = require('../config/db');

const populateLyrics = async (artistId) => {
    try {
        await conexion();

        const artist = await Artist.findById(artistId).populate({
            path: 'albums',
            populate: {
                path: 'songs'
            }
        });

        if (!artist) {
            throw new Error('Artista no encontrado');
        }

        console.log(`🎵 Procesando letras para el artista: ${artist.name}`);

        for (const album of artist.albums) {
            for (const song of album.songs) {
                if (song.lyrics && song.lyrics.trim() !== '') {
                    console.log(`⏩ Lyrics ya existen para: ${song.title}`);
                    continue;
                }

                console.log(`🔍 Obteniendo lyrics para: ${song.title} - ${artist.name}`);
                const lyrics = await getLyrics(artist.name, song.title);

                if (lyrics) {
                    await Song.updateOne({ _id: song._id }, { $set: { lyrics } });
                    console.log(`✅ Lyrics agregados a: ${song.title}`);
                } else {
                    console.log(`⚠️ No se encontraron lyrics para: ${song.title}`);
                }

                // Pequeña pausa para evitar sobrecarga en la API
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`🎉 Proceso completado para: ${artist.name}`);
        return true;
    } catch (error) {
        console.error('❌ Error al poblar las lyrics:', error);
        throw error;
    } finally {
        mongoose.connection.close();
    }
};

module.exports = { populateLyrics };