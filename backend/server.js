const express = require('express');
const { MongoClient } = require('mongodb');
const artistRoutes = require('./routes/artistRoutes'); // Importa las rutas de artistas
const albumRoutes = require('./routes/albumRoutes');
const songRoutes = require('./routes/songRoutes');
const searchRoutes = require('./routes/searchRoutes');
const app = express();
const PORT = 3000;

// Cadena de conexión a MongoDB Atlas
const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyProyecto'; // Reemplaza con tu cadena de conexión
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Variable para almacenar la instancia de la base de datos
let db;

// Conectar a MongoDB al iniciar el servidor
client.connect()
    .then(() => {
        console.log('Conectado a MongoDB Atlas');
        db = client.db('ProyectoDB2'); // Nombre de la base de datos
    })
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Middleware para parsear JSON
app.use(express.json());

// Hacemos la base de datos accesible en las rutas
app.use((req, res, next) => {
    req.app.locals.db = db; // Pasamos la instancia de la base de datos a las rutas
    next();
});

// Rutas de la API
app.use('/api/artists', artistRoutes); // Usa las rutas de artistas
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/search', searchRoutes);
// Servir archivos estáticos (frontend)
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Cerrar la conexión al detener el servidor
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