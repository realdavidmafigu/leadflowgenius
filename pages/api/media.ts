import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mediaDir = path.join(process.cwd(), 'public', 'media');
  if (!fs.existsSync(mediaDir)) {
    return res.status(200).json({ images: [] });
  }
  const files = fs.readdirSync(mediaDir);
  const images = files
    .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map((file) => `/media/${file}`);
  res.status(200).json({ images });
} 