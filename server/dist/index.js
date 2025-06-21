"use strict";
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// API routes
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Serve frontend
const frontendPath = path.join(__dirname, 'client');
app.use(express.static(frontendPath));
app.get('/*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
}
const PORT = process.env.PORT || 5000;
mongoose.connect(MONGO_URI)
    .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});
