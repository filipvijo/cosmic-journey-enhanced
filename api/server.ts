import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import getAstrologyInfo from './getAstrologyInfo';
import getNasaImages from './getNasaImages';
import getPlanetDescription from './getPlanetDescription';
import getPlanetInfo from './getPlanetInfo';
import getPlanetVideos from './getPlanetVideos';
import generateLandscape from './generateLandscape';
import generateSpecies from './generateSpecies';
import getApod from './getApod';

// Explicitly point to the .env file in the parent directory (project root)
// dotenv.config({ path: '../.env' }); // Path relative to this file
dotenv.config(); // Default behavior: load .env from CWD

// Log environment variables to verify they're loaded
console.log('Environment variables loaded:');
console.log('NASA_API_KEY exists:', !!process.env.NASA_API_KEY);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('YOUTUBE_API_KEY exists:', !!process.env.YOUTUBE_API_KEY);
console.log('FAL_KEY exists:', !!process.env.FAL_KEY);

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes - wrap handlers to match Express middleware signature
const wrapHandler = (handler: (req: Request, res: Response) => Promise<any>): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Routes match exactly with frontend requests
app.get('/api/getAstrologyInfo', wrapHandler(getAstrologyInfo));
app.get('/api/getNasaImages', wrapHandler(getNasaImages));
app.get('/api/getPlanetDescription', wrapHandler(getPlanetDescription));
app.get('/api/getPlanetInfo', wrapHandler(getPlanetInfo));
app.get('/api/getPlanetVideos', wrapHandler(getPlanetVideos));
app.get('/api/generateLandscape', wrapHandler(generateLandscape));
app.get('/api/generateSpecies', wrapHandler(generateSpecies));
app.get('/api/getApod', wrapHandler(getApod));

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
