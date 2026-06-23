import { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const initialTests = require('../data/generated-tests.json');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (req.method === 'GET') {
    try {
      if (!hasBlobToken) {
        // Local fallback (read from filesystem)
        const filePath = path.join(process.cwd(), 'data/generated-tests.json');
        if (!fs.existsSync(filePath)) {
          return res.status(200).json(initialTests);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json(JSON.parse(content));
      } else {
        // Vercel Blob path
        const { blobs } = await list();
        const testsBlob = blobs.find(b => b.pathname === 'generated-tests.json');
        if (testsBlob) {
          const fetchRes = await fetch(testsBlob.url);
          const tests = await fetchRes.json();
          return res.status(200).json(tests);
        } else {
          // If no blob exists, upload initial bundle
          await put('generated-tests.json', JSON.stringify(initialTests, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          });
          return res.status(200).json(initialTests);
        }
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Body data is required' });
      }

      if (!hasBlobToken) {
        // Local fallback
        const filePath = path.join(process.cwd(), 'data/generated-tests.json');
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return res.status(200).json({ success: true });
      } else {
        // Vercel Blob path
        await put('generated-tests.json', JSON.stringify(data, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        return res.status(200).json({ success: true });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
