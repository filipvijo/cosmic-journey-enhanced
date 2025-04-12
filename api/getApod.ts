// Use import for Vercel types
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Keep fetch as global

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

// Use export default for the handler
export default async (_request: VercelRequest, response: VercelResponse) => {
  const apiKey = process.env.NASA_API_KEY;

  console.log(`--- Get APOD Handler ---`);
  // --- Add detailed API Key log ---
  if (!apiKey) {
    console.error('Get APOD Error: NASA_API_KEY environment variable is MISSING or empty.');
    return response.status(500).json({ error: 'Server configuration error (Missing NASA API Key).' });
  } else {
    // Log only a portion to confirm it's being read, not the full key
    console.log(`Get APOD Info: NASA_API_KEY is present (starts with: ${apiKey.substring(0, 4)}...).`);
  }
  // --- End log ---

  const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  try {
    console.log(`Get APOD Info: Attempting to fetch from NASA APOD API: ${nasaApiUrl.replace(apiKey, '***')}`); // Hide key in log
    const apiResponse = await fetch(nasaApiUrl);
    console.log(`Get APOD Info: Received response from NASA API. Status: ${apiResponse.status}`); // Log status

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      // --- Add detailed API failure log ---
      console.error(`Get APOD Error: NASA API request failed with status ${apiResponse.status}. Body:`, errorBody);
      // --- End log ---
      return response.status(apiResponse.status).json({
        error: `NASA APOD API request failed: ${apiResponse.status} ${apiResponse.statusText}`,
        details: errorBody
      });
    }

    // --- Add log before parsing JSON ---
    console.log(`Get APOD Info: Attempting to parse NASA API response as JSON.`);
    const data = await apiResponse.json() as ApodResponse;
    console.log(`Get APOD Info: Successfully parsed JSON. APOD data for ${data.date}`);
    // --- End log ---

    const relevantData = {
        title: data.title,
        explanation: data.explanation,
        url: data.url,
        hdurl: data.hdurl,
        media_type: data.media_type,
        date: data.date,
        copyright: data.copyright
    };

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');
    console.log(`Get APOD Info: Sending successful response.`); // Log success
    return response.status(200).json(relevantData);

  } catch (error: any) {
    // --- Add detailed catch block log ---
    console.error(`Get APOD Error: Uncaught error during execution.`, error);
    // --- End log ---
    return response.status(500).json({
        error: `Failed to fetch APOD data: ${error.message}`,
        details: error.stack
    });
  }
};
