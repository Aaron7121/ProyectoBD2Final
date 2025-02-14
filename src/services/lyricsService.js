const { getLyrics } = require('./geniusService');
const Song = require('../models/Song');
const mongoose = require('mongoose');

async function processLyricsInBackground(artistId) {
    try {
        console.log(`🎵 Iniciando proceso de letras para artista ID: ${artistId}`);
        
        // Buscar todas las canciones del artista
        const songs = await Song.find({ 'artists': artistId });
        
        if (!songs || songs.length === 0) {
            console.log('No se encontraron canciones para este artista');
            return;
        }

        const totalSongs = songs.length;
        let processedSongs = 0;

        console.log(`Total de canciones a procesar: ${totalSongs}`);

        // Procesar cada canción
        for (const song of songs) {
            try {
                if (!song.lyrics) {
                    // Obtener el artista name para la búsqueda
                    const artistName = await getArtistName(artistId);
                    const lyrics = await getLyrics(artistName, song.title);
                    
                    if (lyrics) {
                        await Song.findByIdAndUpdate(song._id, { lyrics });
                        console.log(`✅ Lyrics agregadas a: ${song.title}`);
                    }
                }
                processedSongs++;
                console.log(`Progreso: ${processedSongs}/${totalSongs}`);
            } catch (error) {
                console.error(`Error procesando lyrics para ${song.title}:`, error);
            }
            
            // Pequeña pausa entre canciones
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('🎉 Proceso de letras completado');
    } catch (error) {
        console.error('Error en processLyricsInBackground:', error);
        throw error;
    }
}

async function getArtistName(artistId) {
    try {
        const Artist = mongoose.model('Artist');
        const artist = await Artist.findById(artistId);
        return artist ? artist.name : '';
    } catch (error) {
        console.error('Error obteniendo nombre del artista:', error);
        return '';
    }
}

module.exports = { processLyricsInBackground };
