const express = require('express');
const mongoose = require('mongoose'); // Añadir esta importación
const conexion = require('./config/db');
const { MongoClient } = require('mongodb');
const artistRoutes = require('./routes/artistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const songRoutes = require('./routes/songRoutes');
const searchRoutes = require('./routes/searchRoutes');
const app = express();
const PORT = 3000;

const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect()
    .then(() => {
        console.log('Conectado a MongoDB Atlas');
        db = client.db('ProyectoDB2');
    })
    .catch(err => console.error('Error conectando a MongoDB:', err));

app.use(express.json());

app.use((req, res, next) => {
    req.app.locals.db = db;
    next();
});

app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/search', searchRoutes);

const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

conexion().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});

mongoose.connection.on('error', err => {
    console.error('Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
});

process.on('SIGINT', () => {
    client.close()
        .then(() => {
            console.log('Conexión a MongoDB cerrada');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error cerrando la conexión a MongoDB:', err);
            process.exit(1);
        });
});