const express = require('express');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        // Cek jika query kosong
        if (!query) {
            return res.status(400).json({ error: 'Mana keyword-nya, bang?' });
        }

        console.log('Searching for:', query); // Muncul di log Vercel

        const r = await yts(query);
        
        // Cek jika r.videos ada dan tidak kosong
        if (!r || !r.videos || r.videos.length === 0) {
            return res.json({ message: 'Gak ketemu apa-apa, coba keyword lain', results: [] });
        }

        const results = r.videos.slice(0, 10).map(v => ({
            id: v.videoId,
            url: v.url,
            title: v.title,
            timestamp: v.timestamp,
            thumbnail: v.thumbnail,
            author: v.author.name
        }));

        res.json(results);
    } catch (err) {
        console.error('Error Search:', err);
        res.status(500).json({ error: 'Server error nih: ' + err.message });
    }
});

// Endpoint Stream tetap sama
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('Mana ID-nya?');
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    try {
        res.setHeader('Content-Type', 'audio/mpeg');
ytdl(url, { 
    filter: 'audioonly', 
    quality: 'lowestaudio', 
    highWaterMark: 1 << 25  
}).pipe(res);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = app;
