// TEMPORARY TEST api/getNasaImages.ts
import type { Request, Response } from 'express';

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

// Helper function to shuffle array
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

export default async function handler(request: Request, response: Response) {
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

    const NASA_IMAGE_API_URL = `https://images-api.nasa.gov/search?q=${encodeURIComponent(planet)}&media_type=image`;
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
            console.log(`NASA Images: No results found for ${planet}.`);
            return response.status(200).json({ images: [] }); // Return empty array if no results
        }

        console.log(`NASA Images: Found ${items.length} total items for ${planet}. Filtering and selecting.`);

        // Filter, map, shuffle, and slice
        let imageResults: NASAImage[] = items
            .filter((item): item is NasaApiItem & { data: { title: string }[], links: { href: string }[] } => 
                !!item?.links?.[0]?.href && !!item?.data?.[0]?.title // Ensure necessary data exists using type predicate
            )
            .map((item) => ({
                url: item.links[0].href, // Get the image URL
                title: item.data[0].title // Get the title
            }));
        
        imageResults = shuffleArray(imageResults); // Shuffle before slicing
        imageResults = imageResults.slice(0, MAX_IMAGES_TO_RETURN); // Take the top N results

        console.log(`NASA Images: Returning ${imageResults.length} images for ${planet}.`);
        return response.status(200).json({ images: imageResults });

    } catch (error: any) {
        console.error("NASA Images: Error occurred", error);
        return response.status(500).json({ 
            error: error.message || 'Internal server error while fetching NASA images'
        });
    }
}
