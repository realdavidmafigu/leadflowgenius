import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[INVOICES API] ${req.method} request received`);
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[INVOICES API] No authorization header provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('[INVOICES API] Verifying token with Supabase...');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('[INVOICES API] Supabase auth error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!user) {
      console.log('[INVOICES API] No user found from token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log('[INVOICES API] User authenticated:', user.id);
    
    // Check if user exists in Prisma database, if not create them
    console.log('[INVOICES API] Checking user in Prisma database...');
    let prismaUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!prismaUser) {
      console.log('[INVOICES API] Creating new user in Prisma database...');
      try {
        prismaUser = await prisma.user.create({ 
          data: { 
            id: user.id, 
            email: user.email || '' 
          } 
        });
        console.log('[INVOICES API] User created successfully');
      } catch (createError) {
        console.error('[INVOICES API] Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user in database' });
      }
    }

    if (req.method === 'POST') {
      console.log('[INVOICES API] Processing POST request...');
      const { clientId, title, dueDate, currency, items, notes, totalAmount } = req.body;
      if (!clientId || !title || !dueDate || !currency || !items || !totalAmount) {
        console.log('[INVOICES API] Missing required fields:', { clientId, title, dueDate, currency, items: !!items, totalAmount });
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      try {
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
        console.log('[INVOICES API] Invoice created successfully:', invoice.id);
        return res.status(201).json(invoice);
      } catch (createError) {
        console.error('[INVOICES API] Error creating invoice:', createError);
        return res.status(500).json({ error: 'Failed to create invoice' });
      }
    }

    if (req.method === 'GET') {
      console.log('[INVOICES API] Processing GET request...');
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        console.log('[INVOICES API] Fetching single invoice:', id);
        // Fetch a single invoice by id, include client
        try {
          const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { client: true },
          });
          
          if (!invoice) {
            console.log('[INVOICES API] Invoice not found:', id);
            return res.status(404).json({ error: 'Invoice not found' });
          }
          
          if (invoice.userId !== prismaUser.id) {
            console.log('[INVOICES API] Invoice belongs to different user:', invoice.userId, 'vs', prismaUser.id);
            return res.status(404).json({ error: 'Invoice not found' });
          }
          
          console.log('[INVOICES API] Invoice fetched successfully');
          return res.status(200).json({ invoice, client: invoice.client });
        } catch (queryError) {
          console.error('[INVOICES API] Error fetching invoice:', queryError);
          return res.status(500).json({ error: 'Failed to fetch invoice' });
        }
      }
      
      // List all invoices for the user, include client info
      console.log('[INVOICES API] Fetching all invoices for user:', prismaUser.id);
      try {
        const invoices = await prisma.invoice.findMany({
          where: { userId: prismaUser.id },
          include: { client: true },
          orderBy: { createdAt: 'desc' },
        });
        console.log('[INVOICES API] Found', invoices.length, 'invoices');
        return res.status(200).json({ invoices });
      } catch (queryError) {
        console.error('[INVOICES API] Error fetching invoices:', queryError);
        return res.status(500).json({ error: 'Failed to fetch invoices' });
      }
    }

    if (req.method === 'PATCH') {
      console.log('[INVOICES API] Processing PATCH request...');
      const { id, action } = req.body;
      if (!id || typeof id !== 'string') {
        console.log('[INVOICES API] Missing invoice ID in PATCH request');
        return res.status(400).json({ error: 'Invoice ID is required' });
      }
      
      // Find the invoice and ensure it belongs to the user
      try {
        const invoice = await prisma.invoice.findUnique({ where: { id } });
        if (!invoice || invoice.userId !== prismaUser.id) {
          console.log('[INVOICES API] Invoice not found or unauthorized:', id);
          return res.status(404).json({ error: 'Invoice not found' });
        }
        
        if (action === 'generatePaymentLink') {
          console.log('[INVOICES API] Generating payment link for invoice:', id);
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
          console.log('[INVOICES API] Payment link generated successfully');
          return res.status(200).json({ paymentLink: updated.paymentLink });
        }
        
        console.log('[INVOICES API] Invalid action:', action);
        return res.status(400).json({ error: 'Invalid action' });
      } catch (updateError) {
        console.error('[INVOICES API] Error updating invoice:', updateError);
        return res.status(500).json({ error: 'Failed to update invoice' });
      }
    }

    console.log('[INVOICES API] Method not allowed:', req.method);
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error('[INVOICES API] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 