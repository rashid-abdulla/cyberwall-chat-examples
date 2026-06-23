import { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (req.method === 'GET') {
    try {
      if (!hasBlobToken) {
        // Local fallback (read from filesystem)
        const filePath = path.join(process.cwd(), 'data/users.json');
        if (!fs.existsSync(filePath)) {
          const defaultUsers = ["Rashid (Nysaclan)", "Navneeth (Nysaclan)"];
          // Ensure directory exists
          const dirPath = path.dirname(filePath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2), 'utf-8');
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json(JSON.parse(content));
      } else {
        // Vercel Blob path
        const { blobs } = await list();
        const usersBlob = blobs.find(b => b.pathname === 'users.json');
        if (usersBlob) {
          const fetchRes = await fetch(usersBlob.url);
          const users = await fetchRes.json();
          return res.status(200).json(users);
        } else {
          // Initialize Blob
          const defaultUsers = ["Rashid (Nysaclan)", "Navneeth (Nysaclan)"];
          await put('users.json', JSON.stringify(defaultUsers, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          });
          return res.status(200).json(defaultUsers);
        }
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const name = req.body.name?.trim();
      if (!name) {
        return res.status(400).json({ error: 'Username is required' });
      }

      if (!hasBlobToken) {
        // Local fallback
        const filePath = path.join(process.cwd(), 'data/users.json');
        let users = ["Rashid (Nysaclan)", "Navneeth (Nysaclan)"];
        if (fs.existsSync(filePath)) {
          users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        if (name.toLowerCase() !== 'ai generated' && !users.includes(name)) {
          users.push(name);
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
        }
        return res.status(200).json({ success: true, users });
      } else {
        // Vercel Blob path
        const { blobs } = await list();
        let usersBlob = blobs.find(b => b.pathname === 'users.json');
        let users = ["Rashid (Nysaclan)", "Navneeth (Nysaclan)"];
        
        if (usersBlob) {
          const fetchRes = await fetch(usersBlob.url);
          users = await fetchRes.json();
        }

        if (name.toLowerCase() !== 'ai generated' && !users.includes(name)) {
          users.push(name);
          await put('users.json', JSON.stringify(users, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          });
        }
        return res.status(200).json({ success: true, users });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
