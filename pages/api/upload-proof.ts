import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'proofs'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => mimetype && mimetype.startsWith('image/'),
  });
  // Ensure upload dir exists
  fs.mkdirSync(path.join(process.cwd(), 'public', 'proofs'), { recursive: true });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    const file = files.file as formidable.File;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/proofs/${path.basename(file.filepath)}`;
    return res.status(200).json({ url });
  });
} 