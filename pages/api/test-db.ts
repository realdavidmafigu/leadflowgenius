import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[TEST-DB] Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('[TEST-DB] Database connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('[TEST-DB] User count:', userCount);
    
    // Test invoice query
    const invoiceCount = await prisma.invoice.count();
    console.log('[TEST-DB] Invoice count:', invoiceCount);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      userCount,
      invoiceCount,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  } catch (error) {
    console.error('[TEST-DB] Database connection failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  }
} 