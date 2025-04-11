// --- Helper function for shuffling ---
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
// --- ---

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface YouTubeVideo {
    videoId: string;
    title: string;
    thumbnailUrl: string;
}

// Interfaces for YouTube API Response
interface YouTubeSearchResponse {
    items?: YouTubeSearchItem[];
}

interface YouTubeSearchItem {
    id?: { videoId?: string };
    snippet?: {
        title?: string;
        thumbnails?: {
            default?: { url?: string };
            medium?: { url?: string }; // Usually a good size
            high?: { url?: string };
        };
    };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const { planet } = request.query;
    const apiKey = process.env.YOUTUBE_API_KEY;

    console.log("--- YouTube Videos Handler (Live API) ---");
    console.log(`YouTube Key found: ${!!apiKey}`);
    console.log(`Planet requested: ${planet}`);

    if (!planet || typeof planet !== 'string') {
        console.error("YouTube Videos: Missing planet parameter");
        return response.status(400).json({ error: 'Planet parameter is required' });
    }

    if (!apiKey) {
        console.error("YouTube Videos: API key missing");
        return response.status(500).json({ error: 'YouTube API key is not configured' });
    }

    const searchQuery = `${planet} planet documentary`; // Search query for YouTube
    const MAX_VIDEOS_TO_RETURN = 10;
    const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}&maxResults=${MAX_VIDEOS_TO_RETURN}`;

    try {
        console.log(`YouTube Videos: Fetching from YouTube API`);
        const apiResponse = await fetch(YOUTUBE_API_URL);

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error(`YouTube API Error: ${apiResponse.status}`, errorData);
            throw new Error(`Failed to fetch videos from YouTube API. Status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json() as YouTubeSearchResponse; // Use type assertion
        const items = data?.items;

        if (!items || items.length === 0) {
            console.log(`YouTube Videos: No results found for ${planet}.`);
            return response.status(200).json({ videos: [] });
        }

        console.log(`YouTube Videos: Found ${items.length} items for ${planet}. Filtering and mapping.`);

        // Filter out items without necessary info and map to our structure
        const videoResults: YouTubeVideo[] = items
            .filter((item): item is YouTubeSearchItem & { 
                id: { videoId: string }, 
                snippet: { title: string, thumbnails: { default: { url: string }, medium?: {url: string} } } 
            } =>
                !!item?.id?.videoId &&
                !!item?.snippet?.title &&
                !!(item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url)
            )
            .map((item) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url // Prefer medium, fallback to default
            }));

        console.log(`YouTube Videos: Returning ${videoResults.length} videos for ${planet}.`);
        return response.status(200).json({ videos: videoResults });

    } catch (error: any) {
        console.error("YouTube Videos: Error occurred", error);
        return response.status(500).json({ 
            error: error.message || 'Internal server error while fetching YouTube videos'
        });
    }
}
