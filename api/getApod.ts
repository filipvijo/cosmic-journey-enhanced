// api/getApod.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Define the APOD data interface for type safety
interface ApodData {
  title: string;
  explanation: string;
  date: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Log all environment variables for debugging
  console.log('In getApod handler, environment check:');
  console.log('NASA_API_KEY exists:', !!process.env.NASA_API_KEY);
  console.log('Current directory:', process.cwd());
  
  const apiKey = process.env.NASA_API_KEY;

  if (!apiKey) {
    console.error('APOD: NASA API key is not configured.');
    return response.status(500).json({ error: 'NASA API key configuration error.' });
  }

  // Use NASA's demo key as fallback if needed
  const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${apiKey || 'DEMO_KEY'}`;

  console.log(`APOD: Fetching from ${NASA_APOD_URL}`);

  try {
    const apodResponse = await fetch(NASA_APOD_URL);
    console.log('APOD API response status:', apodResponse.status);

    if (!apodResponse.ok) {
      const errorText = await apodResponse.text();
      console.error(`APOD API Error: ${apodResponse.status}`, errorText);
      return response.status(apodResponse.status).json({ 
        error: `NASA APOD API Error: ${apodResponse.status} - ${errorText}` 
      });
    }

    const data = await apodResponse.json() as ApodData;

    console.log(`APOD: Successfully fetched data for date ${data.date}.`);

    // Return the relevant fields
    return response.status(200).json({
      title: data.title,
      explanation: data.explanation,
      date: data.date,
      url: data.url,
      hdurl: data.hdurl,
      media_type: data.media_type,
      copyright: data.copyright
    });

  } catch (error: any) {
    console.error(`APOD: Error fetching data:`, error);
    return response.status(500).json({ 
      error: `Error fetching APOD: ${error.message}` 
    });
  }
}
