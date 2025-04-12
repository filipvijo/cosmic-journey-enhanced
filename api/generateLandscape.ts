// Use import for Vercel types
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Use import for fal client
import fal from '@fal-ai/serverless-client';

// Ensure FAL_KEY is handled if needed, though fal library might handle it implicitly via env
if (!process.env.FAL_KEY) {
    console.warn('FAL_KEY environment variable not set. Fal AI client might rely on other auth methods or fail.');
} else {
    // Initialize Fal.ai client with API key
    fal.config({
        credentials: process.env.FAL_KEY
    });
    console.log('Fal.ai client initialized with API key');
}

// Input type for fal.subscribe (ensure properties match the model's requirements)
interface FalSubscribeInput {
    prompt: string;
    width?: number;
    height?: number;
    // model_name?: string; 
    // Add other valid params from docs if needed
    // negative_prompt?: string;
}

// Output type expected from the Fal AI model (adjust based on actual response)
interface FalResponse {
    images?: { url: string; content_type?: string; width?: number; height?: number }[];
    // Include other potential fields like seed, timings, etc., if needed
}

// Type for the queue update callback parameter
interface FalQueueUpdate {
    status: string;
    logs?: { message: string }[];
    message?: string;
    // Add other potential fields from the update object if known
}

// Use export default for the handler
export default async (request: VercelRequest, response: VercelResponse) => {
    const { planet } = request.query;
    // Fal client uses FAL_KEY from environment automatically if configured correctly
    // const apiKey = process.env.FAL_KEY;

    console.log(`--- Generate Landscape Handler (Fal.ai) ---`);
    console.log(`Planet requested: ${planet}`);

    if (!planet || typeof planet !== 'string') {
        console.error("Generate Landscape: Missing planet parameter");
        return response.status(400).json({ error: 'Planet query parameter is required.' });
    }
    // No need to explicitly check apiKey here, fal library handles it

    // --- Define Prompt Conditionally (keep existing logic) ---
    const planetNameLower = planet.toLowerCase();
    let prompt = "";
    let generateImage = true;
    // Default negative prompt (useful conceptually, but might not be needed/sent)
    // const negative_prompt = "text, labels, watermarks, ui elements, people, humans, astronauts, spacecraft, blurry, low quality, drawing, illustration, sketch, schematic, diagram";

    if (["mercury", "venus", "earth", "mars"].includes(planetNameLower)) {
        prompt = `A highly detailed, photo-realistic landscape view from the surface of the planet ${planet}. Based on scientific data (${
            planet === 'Mars' ? 'reddish rocks and soil, thin hazy atmosphere' :
            planet === 'Venus' ? 'scorching hot surface with thick yellowish clouds, intense atmospheric pressure' :
            planet === 'Mercury' ? 'cratered surface similar to the Moon, extreme temperature variations, no atmosphere' :
            'varied rocky terrain'
        }). Daytime, conditions appropriate for the planet. Vast perspective, wide angle view.`;
    } else if (["jupiter", "saturn"].includes(planetNameLower)) {
        prompt = `A highly detailed, photo-realistic view looking down at the turbulent, swirling cloud tops and atmospheric bands of the gas giant planet ${planet}, as seen from high orbit. Dramatic lighting, deep space background. ${planetNameLower === 'saturn' ? 'Prominent, detailed planetary rings clearly visible.' : ''}`;
    } else if (["uranus", "neptune"].includes(planetNameLower)) {
        prompt = `A highly detailed, photo-realistic visualization of what it might look like inside the atmosphere of ${planet}. Base the visualization on scientific data (hazy, atmospheric cloud tops ${planet === 'Uranus' ? 'with cyan/teal tones' : 'with deep blue tones'}, swirling gas formations, intense storms, and extreme conditions). Wide angle view showing the unique environment of an ice giant.`;
    } else if (planetNameLower === 'sun') {
        prompt = `Standing on the surface of the sun, a surreal and impossible scene unfolds — molten solar flares erupt around me like dancing infernos, the sky above is an intense swirl of glowing plasma and golden storm clouds. The ground is a sea of churning lava, blinding light reflects off every wave. I wear a futuristic heat-proof exosuit glowing with blue energy, surrounded by pillars of fire and magnetic storms. Everything pulses with raw, cosmic energy. (Cinematic wide-angle view, extreme lighting contrast, hyperreal detail, science fiction atmosphere, lens flares and volumetric light)`;
        console.log(`Generate Landscape: Using custom Sci-Fi prompt for the Sun.`);
    } else {
        console.log(`Generate Landscape: No specific landscape prompt for ${planet}. Skipping generation.`);
        generateImage = false;
    }

    if (!generateImage) {
        return response.status(200).json({ imageUrl: null, message: `Image generation skipped for ${planet}.` });
    }
    // --- End Conditional Prompt ---

    console.log(`Generate Landscape: Calling Fal.ai for ${planet} with input:`);

    try {
        const falInput: FalSubscribeInput = {
            prompt: prompt,
            width: 1024,
            height: 576
        };

        console.log(JSON.stringify(falInput, null, 2));
        
        // Use a more reliable model ID for image generation (same as in generateSpecies.ts)
        const modelId = "fal-ai/fast-sdxl";
        const result = await fal.subscribe(modelId, { 
            input: falInput,
            logs: true, 
            onQueueUpdate: (update: FalQueueUpdate) => {
                const logPrefix = `Fal Status (${planet}, ${modelId})`;
                if (update.status === "IN_PROGRESS" && update.logs && update.logs.length > 0) {
                    update.logs.forEach((log: { message: string }) => console.log(`${logPrefix} [Log]:`, log.message));
                } else {
                    console.log(`${logPrefix}: ${update.status}`, update.message || '');
                }
            },
        }) as FalResponse; 

        console.log(`Generate Landscape: Fal.ai raw result for ${planet}:`, JSON.stringify(result, null, 2));
        const imageUrl = result?.images?.[0]?.url;

        if (!imageUrl) {
            console.error('Generate Landscape: Fal.ai result did not contain image URL at images[0].url');
            return response.status(500).json({ error: 'AI image generation succeeded but no URL found in response.', data: result });
        }

        console.log(`Generate Landscape: Extracted image URL for ${planet}: ${imageUrl}`);
        return response.status(200).json({ imageUrl: imageUrl });

    } catch (error: any) {
        console.error(`Generate Landscape: Error calling Fal.ai client for ${planet}:`, error);
        const errorMessage = error.message || 'An unknown error occurred';
        return response.status(500).json({ error: `Internal Server Error generating landscape: ${errorMessage}` });
    }
};
