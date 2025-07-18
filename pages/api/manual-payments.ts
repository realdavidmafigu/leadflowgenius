import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { invoiceId, clientName, message, proofUrl } = req.body;
    if (!invoiceId || !clientName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Check invoice exists
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const payment = await prisma.manualPayment.create({
      data: {
        id: uuidv4(),
        invoiceId,
        clientName,
        message,
        proofUrl,
        status: 'pending',
      },
    });
    return res.status(201).json({ payment });
  }

  // Auth required for GET and PATCH
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
    // Fetch all manual payments for invoices owned by this user
    const payments = await prisma.manualPayment.findMany({
      where: {
        invoice: { userId: prismaUser.id },
      },
      include: { invoice: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ payments });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Find payment and ensure user owns the invoice
    const payment = await prisma.manualPayment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment || payment.invoice.userId !== prismaUser.id) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    await prisma.manualPayment.update({
      where: { id },
      data: { status },
    });
    // If marked as paid, update invoice status and paid field
    if (status === 'paid') {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'Paid', paid: true },
      });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'GET', 'PATCH']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 