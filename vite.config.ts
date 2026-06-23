import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-tests-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'GET' && req.url === '/api/users') {
            try {
              const filePath = path.join(__dirname, 'data/users.json');
              if (!fs.existsSync(filePath)) {
                const defaultUsers = ["Rashid (Nysaclan)"];
                fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2), 'utf-8');
              }
              const content = fs.readFileSync(filePath, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: (error as any).message }));
            }
          } else if (req.method === 'POST' && req.url === '/api/users') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const name = parsed.name?.trim();
                if (!name) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Username is required' }));
                  return;
                }
                const filePath = path.join(__dirname, 'data/users.json');
                let users = ["Rashid (Nysaclan)"];
                if (fs.existsSync(filePath)) {
                  users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                }
                if (name.toLowerCase() !== 'ai generated' && !users.includes(name)) {
                  users.push(name);
                  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, users }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: (error as any).message }));
              }
            });
          } else if (req.url === '/api/save-tests') {
            if (req.method === 'GET') {
              try {
                const filePath = path.join(__dirname, 'data/generated-tests.json');
                const content = fs.readFileSync(filePath, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(content);
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: (error as any).message }));
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const filePath = path.join(__dirname, 'data/generated-tests.json');
                  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: (error as any).message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end();
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
