// api/getApod.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Remove dotenv - Vercel handles environment variables
// import dotenv from 'dotenv';
// Use global fetch if available in Vercel runtime, remove node-fetch import if not needed
// import fetch from 'node-fetch';

// Ensure environment variables are loaded (Removed dotenv.config())

// Define the APOD data interface for type safety
// interface ApodData {
//   title: string;
//   explanation: string;
//   date: string;
//   url: string;
//   hdurl?: string;
//   media_type: 'image' | 'video';
//   copyright?: string;
// }

interface ApodResponse {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
}

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  const apiKey = process.env.NASA_API_KEY;

  console.log(`--- Get APOD Handler ---`);

  if (!apiKey) {
    console.error('Get APOD: NASA_API_KEY environment variable is not configured.');
    // Ensure error response is valid JSON
    return response.status(500).json({ error: 'Server configuration error (Missing NASA API Key).' });
  }

  const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  try {
    console.log(`Get APOD: Fetching data from NASA APOD API: ${nasaApiUrl}`);
    // Use global fetch directly
    const apiResponse = await fetch(nasaApiUrl);

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text(); // Get error as text first
      console.error("Get APOD: NASA API request failed:", apiResponse.status, apiResponse.statusText, errorBody);
      // Ensure error response is valid JSON
      return response.status(apiResponse.status).json({
        error: `NASA APOD API request failed: ${apiResponse.status} ${apiResponse.statusText}`,
        details: errorBody // Include details if possible
      });
    }

    const data = await apiResponse.json() as ApodResponse;
    console.log(`Get APOD: Successfully fetched APOD data for ${data.date}`);

    // Return only necessary fields
    const relevantData = {
        title: data.title,
        explanation: data.explanation,
        url: data.url,
        hdurl: data.hdurl,
        media_type: data.media_type,
        date: data.date,
        copyright: data.copyright
    };

    // Set cache headers for Vercel
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59'); // Cache for 1 hour

    return response.status(200).json(relevantData);

  } catch (error: any) {
    // Log the specific error causing the 500
    console.error(`Get APOD: Uncaught error fetching APOD data:`, error);
    // Ensure error response is valid JSON
    return response.status(500).json({
        error: `Failed to fetch APOD data: ${error.message}`,
        details: error.stack // Include stack trace for debugging if desired
    });
  }
}
