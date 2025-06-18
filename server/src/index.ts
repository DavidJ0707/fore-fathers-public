import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/playerRoutes';
import matchRoutes from './routes/matchRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/dashboard', dashboardRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in your environment variables');
}

const PORT = process.env.PORT || 5000;
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  });
