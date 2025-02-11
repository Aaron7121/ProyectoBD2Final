const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL de la imagen del artista (320x320)
  followers: { type: Number,required: true }, // Número de seguidores
  genres: { type: [String], required: true }, // Géneros musicales
  popularity: { type: Number, required: true }, // Popularidad del artista
  url: { type: String, required: true }, // URL del perfil del artista en Spotify
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }] // Referencias a álbumes
});

// Índice para búsquedas full-text
artistSchema.index({ name: 'text', genres: 'text'});

module.exports = mongoose.model('Artist', artistSchema);