import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { paymentLink } = req.query;
  if (!paymentLink || typeof paymentLink !== 'string') {
    return res.status(400).json({ error: 'Missing payment link' });
  }
  const invoice = await prisma.invoice.findFirst({ where: { paymentLink } });
  if (!invoice || invoice.status === 'Draft') {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  const client = await prisma.client.findUnique({ where: { id: invoice.clientId } });
  return res.status(200).json({ invoice, client });
} 