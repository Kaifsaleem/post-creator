require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const LinkModel = require('./models/Link');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
// GET all links
app.get('/api/links', async (req, res) => {
    try {
        const links = await LinkModel.find().sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST a new link
app.post('/api/links', async (req, res) => {
    try {
        const { title, url, description, postedBy } = req.body;

        if (!title || !url || !postedBy) {
            return res.status(400).json({ message: 'Please provide title, URL and postedBy' });
        }

        const newLink = new LinkModel({
            title,
            url,
            description,
            postedBy
        });

        const savedLink = await newLink.save();
        res.status(201).json(savedLink);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE a link
app.delete('/api/links/:id', async (req, res) => {
    try {
        const link = await LinkModel.findByIdAndDelete(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.json({ message: 'Link deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
