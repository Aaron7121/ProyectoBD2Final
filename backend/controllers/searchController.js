const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function searchArtists(query) {
    await client.connect();
    const collection = client.db('ProyectoDB2').collection('artists');
    return collection.find({ $text: { $search: query } }).toArray();
}

async function searchAlbums(query) {
    await client.connect();
    const collection = client.db('ProyectoDB2').collection('albums');
    return collection.find({ $text: { $search: query } }).toArray();
}

async function searchSongs(query) {
    await client.connect();
    const collection = client.db('ProyectoDB2').collection('songs');
    return collection.find({ $text: { $search: query } }).toArray();
}

module.exports = { searchArtists, searchAlbums, searchSongs };