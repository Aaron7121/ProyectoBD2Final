const mongoose = require('mongoose');

const uri = 'mongodb+srv://adminOsorio:diego123456@spotifyproyecto.ynrks.mongodb.net/ProyectoDB2?retryWrites=true&w=majority&appName=SpotifyProyecto';

const conexion = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('Ya hay una conexión activa a MongoDB');
            return mongoose.connection;
        }

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });

        console.log('Conexión exitosa a MongoDB Atlas');
        return conn;
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error);
        throw error;
    }
};

mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión de MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada');
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar la conexión:', error);
        process.exit(1);
    }
});

module.exports = conexion;
