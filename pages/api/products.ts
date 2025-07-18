import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
    const products = await prisma.product.findMany({
      where: { userId: prismaUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ products });
  }

  if (req.method === 'POST') {
    const { name, description, price, type, category } = req.body;
    if (!name || price === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        userId: prismaUser.id,
        name,
        description,
        price: parseFloat(price),
        type,
        category,
      },
    });
    return res.status(201).json({ product });
  }

  if (req.method === 'PATCH') {
    const { id, name, description, price, type, category } = req.body;
    if (!id || !name || price === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Ensure user owns the product
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.userId !== prismaUser.id) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updated = await prisma.product.update({
      where: { id },
      data: { name, description, price: parseFloat(price), type, category },
    });
    return res.status(200).json({ product: updated });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing product id' });
    }
    // Ensure user owns the product
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.userId !== prismaUser.id) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 