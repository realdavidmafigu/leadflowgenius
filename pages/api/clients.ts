import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    prismaUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || '',
      }
    });
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id && typeof id === 'string') {
      // Fetch a single client by id
      const client = await prisma.client.findUnique({
        where: { id },
      });
      if (!client || client.userId !== prismaUser.id) {
        return res.status(404).json({ error: 'Client not found' });
      }
      return res.status(200).json({ client });
    }
    // List all clients for the user
    const clients = await prisma.client.findMany({
      where: { userId: prismaUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(clients);
  }

  if (req.method === 'POST') {
    const { name, email, phone, company, location, notes } = req.body;
    if (!name || !email || !phone || !company || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await prisma.client.create({
      data: {
        userId: prismaUser.id,
        name,
        email,
        phone,
        company,
        location,
        notes,
      },
    });
    return res.status(201).json(client);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 