import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wardrobeRoutes from './routes/wardrobe';
import advisorRoutes from './routes/advisor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/advisor', advisorRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Wardrobe API running' });
});

app.listen(PORT, () => {
  console.log(`Wardrobe API running on http://localhost:${PORT}`);
});

export default app;
