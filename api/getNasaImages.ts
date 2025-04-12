// Use import for Vercel types
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NASAImage {
    url: string;
    title: string;
}

// Interface for the expected NASA Image Search API response structure
interface NasaApiResponse {
    collection?: {
        items?: NasaApiItem[];
    };
}

interface NasaApiItem {
    data?: { title?: string }[];
    links?: { href?: string }[];
}

// Use export default for the handler
export default async (request: VercelRequest, response: VercelResponse) => {
    const { planet } = request.query;
    const apiKey = process.env.NASA_API_KEY;

    console.log("--- NASA IMAGES Handler (Live API) ---");
    console.log(`NASA Key found: ${!!apiKey}`);
    console.log(`Planet requested: ${planet}`);

    if (!planet || typeof planet !== 'string') {
        console.error("NASA Images: Missing planet parameter");
        return response.status(400).json({ error: 'Planet parameter is required' });
    }

    if (!apiKey) {
        console.error("NASA Images: API key missing");
        return response.status(500).json({ error: 'NASA API key is not configured' });
    }

    // Add "planet" to the query for more relevance
    const searchTerm = `${planet} planet`; 
    const NASA_IMAGE_API_URL = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=image`;
    
    const MAX_IMAGES_TO_RETURN = 10; // How many images to show in the frontend carousel

    try {
        console.log(`NASA Images: Fetching from ${NASA_IMAGE_API_URL}`);
        const apiResponse = await fetch(NASA_IMAGE_API_URL);

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`NASA Images API Error: ${apiResponse.status}`, errorText);
            throw new Error(`Failed to fetch images from NASA API. Status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json() as NasaApiResponse; // Use type assertion
        let items = data?.collection?.items;

        if (!items || items.length === 0) {
            console.log(`NASA Images: No results found for ${searchTerm}.`);
            return response.status(200).json({ images: [] }); // Return empty array if no results
        }

        console.log(`NASA Images: Found ${items.length} total items for ${searchTerm}. Filtering and selecting.`);

        // Enhanced Filtering
        const planetLower = planet.toLowerCase();
        const excludedKeywords = ['logo', 'illustration', 'concept', 'artist', 'model', 'graphic']; // Add more if needed

        let imageResults: NASAImage[] = items
            .filter((item): item is NasaApiItem & { data: { title: string }[], links: { href: string }[] } => {
                const title = item?.data?.[0]?.title?.toLowerCase();
                const link = item?.links?.[0]?.href;
                
                if (!title || !link) return false; // Must have title and link

                // Ensure title contains the planet name (case-insensitive)
                if (!title.includes(planetLower)) return false; 

                // Ensure title does not contain excluded keywords
                if (excludedKeywords.some(keyword => title.includes(keyword))) return false;

                return true; // Passed filters
            })
            .map((item) => ({
                url: item.links[0].href, // Get the image URL
                title: item.data[0].title // Get the title
            }));
        
        imageResults = imageResults.slice(0, MAX_IMAGES_TO_RETURN); // Take the top N relevant results

        console.log(`NASA Images: Returning ${imageResults.length} filtered images for ${planet}.`);
        return response.status(200).json({ images: imageResults });

    } catch (error: any) {
        console.error("NASA Images: Error occurred", error);
        return response.status(500).json({ 
            error: error.message || 'Internal server error while fetching NASA images'
        });
    }
};
