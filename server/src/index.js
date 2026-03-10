import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.chdir(join(__dirname, '..'));

import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview.js';
import uploadRoutes from './routes/upload.js';
import catRoutes from './routes/cats.js';
import foodRoutes from './routes/food.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/food', foodRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🐱 喵健康服务已启动: http://localhost:${PORT}`);
});
