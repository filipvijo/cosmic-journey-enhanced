import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function middleware(req: VercelRequest, res: VercelResponse, next?: () => void): VercelResponse | undefined;
