const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const playerRoutes = require('./routes/playerRoutes').default;
const matchRoutes = require('./routes/matchRoutes').default;
const dashboardRoutes = require('./routes/dashboardRoutes').default;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/dashboard', dashboardRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined');
}

const PORT = process.env.PORT || 5000;
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  });
