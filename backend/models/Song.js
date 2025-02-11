const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: String,
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    duration: Number,
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    url: String,
    lyrics: String,
});

module.exports = mongoose.model('Song', songSchema);