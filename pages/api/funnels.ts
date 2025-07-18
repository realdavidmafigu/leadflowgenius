import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user exists in Prisma database, if not create them
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!prismaUser) {
      // Create user in Prisma database
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
        }
      });
    }

    // Fetch funnels for the user
    const funnels = await prisma.funnel.findMany({
      where: { userId: prismaUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ funnels });
  } catch (error) {
    console.error('Error fetching funnels:', error);
    return res.status(500).json({ error: 'Failed to fetch funnels' });
  }
} 