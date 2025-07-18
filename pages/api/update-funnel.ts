import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { funnelId, layout, published } = req.body;
    
    if (!funnelId) {
      return res.status(400).json({ error: 'Funnel ID is required' });
    }

    // Check if user exists in Prisma database, if not create them
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!prismaUser) {
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
        }
      });
    }

    // Update the funnel
    const updatedFunnel = await prisma.funnel.update({
      where: { 
        id: funnelId,
        userId: prismaUser.id // Ensure user owns this funnel
      },
      data: {
        layout: layout || [],
        published: published !== undefined ? published : false,
      },
    });

    return res.status(200).json({ funnel: updatedFunnel });
  } catch (error) {
    console.error('Error updating funnel:', error);
    return res.status(500).json({ error: 'Failed to update funnel' });
  }
} 