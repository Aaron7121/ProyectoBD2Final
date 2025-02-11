const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const albums = await db.collection('albums').find().limit(10).toArray();
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;