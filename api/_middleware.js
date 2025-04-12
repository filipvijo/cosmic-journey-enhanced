// Express middleware for API routes
export default function middleware(req, res, next) {
    // Log the request for debugging
    console.log(`API Request: ${req.method} ${req.url}`);
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Handle OPTIONS method
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // Call next if provided (may not be available in all Vercel contexts)
    if (next) {
        next();
    }
    return;
}
//# sourceMappingURL=_middleware.js.map