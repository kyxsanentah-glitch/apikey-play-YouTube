const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. Endpoint untuk ambil info (Judul, Thumbnail, dll)
app.get('/api/info', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: 'URL is required' });

    try {
        const info = await ytdl.getInfo(videoURL);
        const details = {
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            duration: info.videoDetails.lengthSeconds,
            formats: info.formats.map(f => ({
                quality: f.qualityLabel || f.audioQuality,
                extension: f.container,
                hasVideo: f.hasVideo,
                hasAudio: f.hasAudio
            }))
        };
        res.json(details);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Endpoint untuk Play/Stream (MP3 atau MP4)
app.get('/api/stream', async (req, res) => {
    const { url, type } = req.query; // type: 'audio' atau 'video'
    if (!url) return res.status(400).send('URL is required');

    try {
        const options = type === 'audio' 
            ? { filter: 'audioonly', quality: 'highestaudio' } 
            : { filter: 'bitrate', quality: 'highest' };

        res.setHeader('Content-Type', type === 'audio' ? 'audio/mpeg' : 'video/mp4');
        
        // Melakukan pipe (streaming) langsung ke response
        ytdl(url, options).pipe(res);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = app;
