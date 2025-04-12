export default async function handler(request, response) {
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
        const data = await apiResponse.json();
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
    }
    catch (error) {
        // Log the specific error causing the 500
        console.error(`Get APOD: Uncaught error fetching APOD data:`, error);
        // Ensure error response is valid JSON
        return response.status(500).json({
            error: `Failed to fetch APOD data: ${error.message}`,
            details: error.stack // Include stack trace for debugging if desired
        });
    }
}
//# sourceMappingURL=getApod.js.map