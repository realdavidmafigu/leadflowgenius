import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  let prismaUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!prismaUser) {
    prismaUser = await prisma.user.create({ data: { id: user.id, email: user.email || '' } });
  }

  if (req.method === 'POST') {
    const { clientId, title, dueDate, currency, items, notes, totalAmount } = req.body;
    if (!clientId || !title || !dueDate || !currency || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const invoice = await prisma.invoice.create({
      data: {
        id: uuidv4(),
        clientId,
        userId: prismaUser.id,
        title,
        dueDate: new Date(dueDate),
        currency,
        items,
        notes,
        totalAmount: parseFloat(totalAmount),
        status: 'Draft',
        paymentLink: '',
      },
    });
    return res.status(201).json(invoice);
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id && typeof id === 'string') {
      // Fetch a single invoice by id, include client
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: true },
      });
      if (!invoice || invoice.userId !== prismaUser.id) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      return res.status(200).json({ invoice, client: invoice.client });
    }
    // List all invoices for the user, include client info
    const invoices = await prisma.invoice.findMany({
      where: { userId: prismaUser.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ invoices });
  }

  if (req.method === 'PATCH') {
    const { id, action } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invoice ID is required' });
    }
    // Find the invoice and ensure it belongs to the user
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== prismaUser.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (action === 'generatePaymentLink') {
      // Generate a unique payment link (short uuid or nanoid)
      const { customAlphabet } = await import('nanoid');
      const nanoid = customAlphabet('1234567890abcdef', 10);
      let uniqueLink;
      let exists = true;
      // Ensure uniqueness
      while (exists) {
        uniqueLink = nanoid();
        const existing = await prisma.invoice.findFirst({ where: { paymentLink: uniqueLink } });
        exists = !!existing;
      }
      const updated = await prisma.invoice.update({
        where: { id },
        data: { paymentLink: uniqueLink },
      });
      return res.status(200).json({ paymentLink: updated.paymentLink });
    }
    return res.status(400).json({ error: 'Invalid action' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 