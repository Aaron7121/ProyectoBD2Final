const Artist = require('../models/Artist'); // Asegúrate de importar el modelo

// Función para buscar artistas con full-text search
const searchArtists = async (req, res) => {
    try {
        const query = req.query.query; // Obtener la búsqueda desde el frontend
        if (!query) {
            return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
        }

        // Búsqueda en MongoDB usando full-text search
        const artists = await Artist.find({ $text: { $search: query } })
            .limit(18) // Solo 18 artistas como máximo
            .select('name images external_urls.spotify') // Solo los campos necesarios

        res.json(artists);
    } catch (error) {
        console.error('Error en la búsqueda de artistas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { searchArtists };
