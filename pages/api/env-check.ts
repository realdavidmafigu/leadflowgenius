import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const envCheck = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL
  };
  
  console.log('[ENV-CHECK] Environment variables:', envCheck);
  
  res.status(200).json({
    success: true,
    environment: envCheck,
    message: 'Environment variables check completed'
  });
} 