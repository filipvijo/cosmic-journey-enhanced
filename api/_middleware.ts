import type { Request, Response, NextFunction } from 'express';

// Express middleware for API routes
export default function middleware(req: Request, res: Response, next: NextFunction) {
  // Log the request for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  
  // Allow CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}
