


// routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const { searchArtists } = require('../controllers/searchController');

router.get('/', async (req, res) => {
  // Extraemos los parámetros enviados en la URL:
  // - query: el término de búsqueda
  // - filter: el tipo de búsqueda ("artists", "albums", "songs", etc.)
  // - genre: el género seleccionado (opcional, para artistas)
  const { query, filter, genre } = req.query;

  try {
    let results = [];
    // Si el filtro es "artists", usamos la función searchArtists.
    if (filter === 'artists') {
      results = await searchArtists(query, genre);
    }else if (filter === 'albums') {
      results = await searchAlbums(query);
    } else if (filter === 'songs') {
      results = await searchSongs(query);
    }

    // (Si en el futuro implementas álbumes o canciones, se agregan aquí)

    // Enviamos los resultados como respuesta en formato JSON.
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
