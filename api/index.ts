import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  // Simple health check endpoint
  response.status(200).json({ 
    status: 'ok',
    message: 'Cosmic Journey API is running',
    endpoints: [
      '/api/getAstrologyInfo',
      '/api/getNasaImages',
      '/api/getPlanetDescription',
      '/api/getPlanetInfo',
      '/api/getPlanetVideos',
      '/api/generateLandscape',
      '/api/generateSpecies',
      '/api/getApod'
    ]
  });
}
