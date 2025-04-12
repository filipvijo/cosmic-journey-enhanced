export default async function handler(request, response) {
    // Simple health check endpoint
    response.status(200).json({
        status: 'ok',
        message: 'Cosmic Journey API is running',
        endpoints: [
            '/api/getAstrologyInfo',
            '/api/getNasaImages',
            '/api/getPlanetDescription',
            '/api/getPlanetInfo',
            '/api/getPlanetVideos',
            '/api/generateLandscape',
            '/api/generateSpecies',
            '/api/getApod'
        ]
    });
}
//# sourceMappingURL=index.js.map