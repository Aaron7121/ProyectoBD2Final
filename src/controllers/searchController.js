const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function searchArtists(query) {
    try {
        await client.connect();
        const collection = client.db('ProyectoDB2').collection('artists');

        const results = await collection
            .find({
                name: { $regex: new RegExp(query, 'i') }
            })
            .project({
                name: 1,
                image: 1,
                followers: 1,
                genres: 1,
                popularity: 1,
                url: 1,
                _id: 1
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

async function checkArtistExists(artistName) {
    try {
        await client.connect();
        const collection = client.db('ProyectoDB2').collection('artists');
        
        const artist = await collection.findOne({
            name: { $regex: new RegExp(`^${artistName}$`, 'i') }
        });
        
        return !!artist;
    } catch (error) {
        console.error('Error checking artist existence:', error);
        throw error;
    }
}

module.exports = {
    searchArtists,
    searchAlbums,
    searchSongs,
    searchByGenre,  // Añadir la nueva función al export
    checkArtistExists
};