// Use import for Vercel types
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Use namespace import for fal client
import * as fal from '@fal-ai/serverless-client';

interface SpeciesInfo {
    category: 'Micro-organism' | 'Animal' | 'Humanoid';
    name: string;
    description: string;
    imageUrl?: string | null;
}

interface OpenAIChatChoice {
    message?: { content?: string | null };
}
interface OpenAIResponse {
    choices?: OpenAIChatChoice[];
    error?: { message: string };
}

interface FalSubscribeInput {
    prompt: string;
    width?: number;
    height?: number;
}

interface FalResponse {
    images?: { url: string }[];
}

interface FalQueueUpdate {
    status: string;
    logs?: { message: string }[];
    message?: string;
}

if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY environment variable not set.');
}
if (!process.env.FAL_KEY) {
    console.warn('FAL_KEY environment variable not set.');
}

// Initialize Fal.ai client with API key
if (process.env.FAL_KEY) {
    fal.config({
        credentials: process.env.FAL_KEY
    });
    console.log('Fal.ai client initialized with API key');
}

// Use export default for the handler
export default async (request: VercelRequest, response: VercelResponse) => {
    const { planet } = request.query;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    console.log(`--- Generate Species Handler (OpenAI + Fal.ai) ---`);
    console.log(`Planet requested: ${planet}`);

    if (!planet || typeof planet !== 'string') {
        console.error("Generate Species: Missing planet parameter");
        return response.status(400).json({ error: 'Planet query parameter is required.' });
    }
    if (!openAIApiKey) {
        console.error('Generate Species: OPENAI_API_KEY environment variable is not configured.');
        return response.status(500).json({ error: 'AI configuration error (Missing OpenAI Key).' });
    }
    if (!process.env.FAL_KEY) {
        console.error('Generate Species: FAL_KEY environment variable is not configured.');
        console.warn('Warning: FAL_KEY environment variable is not set. Fal.ai client might fail if not configured internally.');
    }

    const planetNameLower = planet.toLowerCase();
    let habitablePromptPrefix = "";

    if (["mercury", "venus", "mars"].includes(planetNameLower)) {
        habitablePromptPrefix = `Imagine that in a protected environment or special evolutionary conditions on ${planet}, life has evolved to survive the extreme conditions. `;
    } else if (["jupiter", "saturn"].includes(planetNameLower)) {
        habitablePromptPrefix = `Imagine that in the upper atmosphere of ${planet}, life has evolved to survive the gaseous environment. `;
    } else if (["uranus", "neptune"].includes(planetNameLower)) {
        habitablePromptPrefix = `Imagine that in the outer atmospheric layers of ${planet}, in regions with more moderate temperatures and pressures, unique life has evolved. `;
    }

    console.log(`Generate Species: Requesting species descriptions for ${planet} from OpenAI...`);
    let speciesList: SpeciesInfo[] = [];
    try {
        const openAIPrompt = `${habitablePromptPrefix}Invent exactly three distinct hypothetical species that *might* evolve there:
        1. One plausible micro-organism.
        2. One plausible animal-like creature (non-sentient).
        3. One plausible sentient humanoid-like species.
        
        For each species, provide a creative name and a detailed description (100-150 words) that includes:
        - Physical appearance and adaptations to the environment
        - Feeding habits and diet
        - Natural habitat and where they typically live
        - Most known behaviors and social structures (if applicable)
        - One interesting and unique fact about the species
        
        Respond ONLY with a valid JSON array containing three objects. Each object must have keys: "category" (string: "Micro-organism", "Animal", or "Humanoid"), "name" (string), and "description" (string). Example object: {"category": "Animal", "name": "Rock-Skimmer", "description": "..."}`;

        const openAIRequestBody = {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: openAIPrompt }],
            temperature: 0.8,
            max_tokens: 1000
        };

        console.log("Generate Species: Sending request to OpenAI:", JSON.stringify(openAIRequestBody, null, 2));

        // Try using Azure OpenAI endpoint if the key format suggests Azure
        const isAzureKey = openAIApiKey.startsWith('k-svcacct-');
        let apiUrl = 'https://api.openai.com/v1/chat/completions';
        let headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIApiKey}`
        };
        
        // If using Azure OpenAI, adjust the URL and headers
        if (isAzureKey) {
            // This is a guess at the Azure OpenAI endpoint format - you may need to adjust
            // Check your Azure OpenAI deployment for the correct endpoint
            const azureResourceName = process.env.AZURE_OPENAI_RESOURCE || 'your-resource-name';
            const azureDeploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || 'your-deployment-id';
            apiUrl = `https://${azureResourceName}.openai.azure.com/openai/deployments/${azureDeploymentId}/chat/completions?api-version=2023-05-15`;
            headers = {
                'Content-Type': 'application/json',
                // Use api-key header for Azure OpenAI
                'api-key': openAIApiKey
            };
            console.log("Using Azure OpenAI endpoint:", apiUrl);
        }

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(openAIRequestBody)
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error("Generate Species: OpenAI API request failed:", res.status, res.statusText, errorBody);
            throw new Error(`OpenAI API request failed: ${res.status} ${res.statusText} - ${errorBody}`);
        }

        const data = await res.json() as OpenAIResponse;
        console.log("Generate Species: Received raw response from OpenAI:", JSON.stringify(data, null, 2));

        if (data.error) {
            console.error("Generate Species: OpenAI API returned an error:", data.error.message);
            throw new Error(`OpenAI API Error: ${data.error.message}`);
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            console.error("Generate Species: No content found in OpenAI response.", data);
            throw new Error('No content received from OpenAI.');
        }

        console.log("Generate Species: Raw content string from OpenAI:", content);
        try {
            let jsonString = content.trim();
            const jsonStartIndex = jsonString.indexOf('[');
            const jsonEndIndex = jsonString.lastIndexOf(']');

            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                jsonString = jsonString.substring(jsonStartIndex, jsonEndIndex + 1);
                console.log("Generate Species: Extracted potential JSON string:", jsonString);
            } else {
                console.warn("Generate Species: Could not find JSON array brackets '[' and ']' in OpenAI content. Attempting to parse anyway.");
            }

            speciesList = JSON.parse(jsonString) as SpeciesInfo[];

            if (!Array.isArray(speciesList) || speciesList.length !== 3) {
                console.error(`Generate Species: OpenAI response is not a valid array of 3 species objects after parsing. Parsed:`, speciesList);
                throw new Error(`OpenAI response is not a valid array of 3 species objects.`);
            }
            speciesList.forEach((s, i) => {
                if (!s || typeof s !== 'object' || !s.category || !s.name || !s.description) {
                    console.error(`Generate Species: Invalid species object structure at index ${i} from OpenAI. Object:`, s);
                    throw new Error(`Invalid species object structure at index ${i} from OpenAI.`);
                }
            });
        } catch (parseError: any) {
            console.error("Generate Species: Failed to parse JSON from OpenAI response content:", parseError, "Attempted to parse:", content);
            throw new Error(`Failed to parse JSON from OpenAI response: ${parseError.message}`);
        }

        console.log(`Generate Species: Successfully parsed ${speciesList.length} species descriptions from OpenAI.`);
    } catch (error: any) {
        console.error(`Generate Species: Error getting species descriptions from OpenAI for ${planet}:`, error);
        return response.status(500).json({ error: `Failed to get species descriptions: ${error.message}` });
    }

    console.log(`Generate Species: Requesting ${speciesList.length} images from Fal.ai for ${planet} species...`);

    try {
        const imagePromises = speciesList.map(species => {
            const imagePrompt = `Detailed scientific illustration of a hypothetical ${species.category.toLowerCase()} named "${species.name}" from planet ${planet}. Appearance based on this description: "${species.description}". Neutral background, high detail, photorealistic style.`;
            const falInput: FalSubscribeInput = {
                prompt: imagePrompt,
                width: 1024,
                height: 1024
            };

            console.log(`Generate Species: Submitting Fal.ai request for "${species.name}" with input:`, JSON.stringify(falInput, null, 2));
            // --- Change the model ID to use FLUX ---
            const modelId = "fal-ai/flux/dev";
            return fal.subscribe(modelId, {
                input: falInput,
                logs: true,
                onQueueUpdate: (update: FalQueueUpdate) => {
                    const logPrefix = `Fal Status (${species.name}, ${modelId})`;
                    if (update.status === "IN_PROGRESS" && update.logs && update.logs.length > 0) {
                        update.logs.forEach((log: { message: string }) => console.log(`${logPrefix} [Log]:`, log.message));
                    } else {
                        console.log(`${logPrefix}: ${update.status}`, update.message || '');
                    }
                }
            }) as Promise<FalResponse>;
        });

        const imageResults = await Promise.allSettled(imagePromises);

        imageResults.forEach((result, index) => {
            const speciesName = speciesList[index].name;
            if (result.status === 'fulfilled') {
                const falResponse = result.value;
                console.log(`Generate Species: Fal.ai raw SUCCESS response for ${speciesName}:`, JSON.stringify(falResponse, null, 2));

                // Check for images array and extract URL with better error handling
                if (falResponse && falResponse.images && Array.isArray(falResponse.images) && falResponse.images.length > 0) {
                    const imageUrl = falResponse.images[0]?.url;
                    if (imageUrl) {
                        console.log(`Generate Species: Fal.ai image URL found for ${speciesName}: ${imageUrl}`);
                        speciesList[index].imageUrl = imageUrl;
                    } else {
                        console.error(`Generate Species: Fal.ai image URL MISSING for ${speciesName} even though images array exists.`);
                        speciesList[index].imageUrl = null;
                    }
                } else {
                    console.error(`Generate Species: Fal.ai response structure unexpected for ${speciesName}. Response:`, falResponse);
                    speciesList[index].imageUrl = null;
                }
            } else {
                console.error(`Generate Species: Fal.ai image generation FAILED for ${speciesName}. Reason:`, result.reason);
                speciesList[index].imageUrl = null;
            }
        });

        console.log(`Generate Species: Finished Fal.ai image generation attempts.`);
        return response.status(200).json({ species: speciesList });
    } catch (error: any) {
        console.error(`Generate Species: Uncaught error during Fal.ai image generation phase for ${planet}:`, error);
        speciesList.forEach(s => { if (s.imageUrl === undefined) s.imageUrl = null; });
        return response.status(500).json({
            species: speciesList,
            error: `Internal Server Error during species image generation: ${error.message}`
        });
    }
};