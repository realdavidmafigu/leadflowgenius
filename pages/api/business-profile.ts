import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth required
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  let prismaUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!prismaUser) {
    prismaUser = await prisma.user.create({ data: { id: user.id, email: user.email || '' } });
  }

  if (req.method === 'GET') {
    const profile = await prisma.businessProfile.findUnique({ where: { userId: prismaUser.id } });
    return res.status(200).json({ profile });
  }

  if (req.method === 'POST') {
    const { name, logoUrl, phone, email, website, address, paymentInstructions } = req.body;
    if (!name || !phone || !email || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let profile = await prisma.businessProfile.findUnique({ where: { userId: prismaUser.id } });
    if (profile) {
      profile = await prisma.businessProfile.update({
        where: { userId: prismaUser.id },
        data: { name, logoUrl, phone, email, website, address, paymentInstructions },
      });
    } else {
      profile = await prisma.businessProfile.create({
        data: { userId: prismaUser.id, name, logoUrl, phone, email, website, address, paymentInstructions },
      });
    }
    return res.status(200).json({ profile });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 