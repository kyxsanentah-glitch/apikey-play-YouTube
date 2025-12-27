const express = require('express');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

// ENDPOINT 1: Mencari lagu (Search)
// Contoh: /api/search?q=noah+menghapus-jejakmu
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query search (q) diperlukan' });

    try {
        const r = await yts(query);
        const videos = r.videos.slice(0, 10); // Ambil 10 hasil teratas
        
        const results = videos.map(v => ({
            id: v.videoId,
            url: v.url,
            title: v.title,
            timestamp: v.timestamp,
            thumbnail: v.thumbnail,
            author: v.author.name
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ENDPOINT 2: Stream MP3 (Putar)
// Contoh: /api/stream?id=VIDEO_ID
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID Video diperlukan');

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        res.setHeader('Content-Type', 'audio/mpeg');
        
        // Filter hanya audio dengan kualitas terbaik
        ytdl(url, { 
            filter: 'audioonly', 
            quality: 'highestaudio' 
        }).pipe(res);
        
    } catch (err) {
        res.status(500).send('Gagal memutar audio: ' + err.message);
    }
});

module.exports = app;
