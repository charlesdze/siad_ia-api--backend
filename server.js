const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logger simple pour voir les requêtes entrantes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Déclaration des routes
app.use('/api/siad/auth', authRoutes);
app.use('/api/siad', messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur SIAD REST API disponible sur le port ${PORT}`);
    console.log(`🔑 DB_NAME: ${process.env.DB_NAME}`);
    console.log(`🔑 GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
});
