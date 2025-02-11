const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function searchArtists(query, genre) {
    try {
        await client.connect();
        const collection = client.db('ProyectoDB2').collection('artists');

        // Búsqueda más flexible usando regex para el nombre
        let searchCriteria = {
            name: { $regex: query, $options: 'i' }  // Búsqueda case-insensitive
        };

        // Agregar filtro de género si está especificado
        if (genre && genre !== 'all' && genre !== 'Seleccione una opcion') {
            searchCriteria.genres = genre;
        }

        // Realizar búsqueda y limitar a 18 resultados
        const results = await collection
            .find(searchCriteria)
            .project({
                name: 1,
                image: 1,           // Cambio de image_url a image
                followers: 1,
                genres: 1,
                popularity: 1,      // Agregado popularity
                url: 1              // Cambio de spotify_url a url
            })
            .limit(18)
            .toArray();

        return results;
    } catch (error) {
        console.error('Error en searchArtists:', error);
        throw error;
    }
}

module.exports = {
    searchArtists
};