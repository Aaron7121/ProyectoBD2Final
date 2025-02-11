const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    name: String,
    image: String,
    releaseDate: Date,
    totalTracks: Number,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
});

module.exports = mongoose.model('Album', albumSchema);