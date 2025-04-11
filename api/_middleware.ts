import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log(`API Request: ${request.method} ${request.url}`);
  
  // Allow CORS
  const response = new Response();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
