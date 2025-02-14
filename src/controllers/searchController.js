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

async function searchAlbums(query) {
    let clientConnection;
    try {
        clientConnection = await client.connect();
        const collection = client.db('ProyectoDB2').collection('albums');

        const results = await collection
            .find({
                name: { $regex: query, $options: 'i' }
            })
            .project({
                name: 1,
                image: 1,
                releaseDate: 1,
                totalTracks: 1,
                _id: 1
            })
            .limit(18)
            .toArray();

        return results;
    } catch (error) {
        console.error('Error en searchAlbums:', error);
        throw new Error('Error al buscar álbumes: ' + error.message);
    } finally {
        if (clientConnection) {
            await clientConnection.close();
        }
    }
}

async function searchSongs(query) {
    let clientConnection;
    try {
        clientConnection = await client.connect();
        const collection = client.db('ProyectoDB2').collection('songs');

        // Asegúrate de que el campo title tenga un índice de texto antes de usar $text
        const results = await collection
            .find({
                $text: { $search: query }  // Cambiamos la búsqueda a texto completo
            })
            .project({
                title: 1,
                duration: 1,
                album: 1,
                lyrics: 1,
                url: 1,
            })
            .limit(20)
            .toArray();

        return results;
    } catch (error) {
        console.error('Error en searchSongs:', error);
        throw new Error('Error al buscar canciones: ' + error.message);
    } finally {
        if (clientConnection) {
            await clientConnection.close();
        }
    }
}

async function searchByGenre(query) {
    try {
        await client.connect();
        const collection = client.db('ProyectoDB2').collection('artists');

        const results = await collection.aggregate([
            {
                $search: {
                    "index": "generos",
                    "text": {
                        "query": query,
                        "path": "genres"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    followers: 1,
                    genres: 1,
                    popularity: 1,
                    url: 1
                }
            },
            {
                $limit: 18
            }
        ]).toArray();

        return results;
    } catch (error) {
        console.error('Error en searchByGenre:', error);
        throw error;
    }
}

module.exports = {
    searchArtists,
    searchAlbums,
    searchSongs,
    searchByGenre  // Añadir la nueva función al export
};