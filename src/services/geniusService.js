const { Client } = require('genius-lyrics'); // Importar correctamente

const geniusClient = new Client("YRjWT5Met9NGbYpR5gEAwt12goWFrJt-zAgEwQsYKT8fUecfPFgPdvN5tY_sTpWa");

const getLyrics = async (artistName, songTitle) => {
  try {
    // Buscar la canción
    const searches = await geniusClient.songs.search(`${artistName} ${songTitle}`);
    if (!searches.length) {
      console.log('No se encontraron resultados para la búsqueda.');
      return null;
    }

    // Obtener la primera coincidencia
    const song = searches[0];
    console.log(`Canción encontrada: ${song.title} por ${song.artist.name}`);

    // Obtener la letra
    const lyrics = await song.lyrics();
    return lyrics;
  } catch (error) {
    console.error(`Error al obtener la letra de ${songTitle}:`, error.message);
    return null;
  }
};

module.exports = { getLyrics };
