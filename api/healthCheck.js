// Health check endpoint to verify API functionality and environment variables
export default async function handler(request, response) {
    const apiEndpoints = [
        { name: 'getPlanetInfo', path: '/api/getPlanetInfo?planet=mars', description: 'Get basic information about a planet' },
        { name: 'getPlanetDescription', path: '/api/getPlanetDescription?planet=mars', description: 'Get detailed description of a planet' },
        { name: 'getAstrologyInfo', path: '/api/getAstrologyInfo?planet=mars', description: 'Get astrological information about a planet' },
        { name: 'getNasaImages', path: '/api/getNasaImages?planet=mars', description: 'Get NASA images related to a planet' },
        { name: 'getPlanetVideos', path: '/api/getPlanetVideos?planet=mars', description: 'Get YouTube videos related to a planet' },
        { name: 'generateSpecies', path: '/api/generateSpecies?planet=mars', description: 'Generate hypothetical alien species for a planet' },
        { name: 'generateLandscape', path: '/api/generateLandscape?planet=mars', description: 'Generate landscape image for a planet' },
        { name: 'getApod', path: '/api/getApod', description: 'Get NASA Astronomy Picture of the Day' }
    ];
    const environmentStatus = {
        NASA_API_KEY: !!process.env.NASA_API_KEY ? 'Configured' : 'Missing',
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
        FAL_KEY: !!process.env.FAL_KEY ? 'Configured' : 'Missing',
        YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY ? 'Configured' : 'Missing',
        NODE_ENV: process.env.NODE_ENV || 'Not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'Not set'
    };
    return response.status(200).json({
        status: 'OK',
        message: 'Cosmic Journey API is running',
        timestamp: new Date().toISOString(),
        apiEndpoints,
        environmentStatus
    });
}
//# sourceMappingURL=healthCheck.js.map