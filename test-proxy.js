import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use('/api', createProxyMiddleware({ 
    target: 'http://example.com', 
    changeOrigin: true,
    onProxyReq: (proxyReq) => console.log('Outgoing path:', proxyReq.path)
}));

const server = app.listen(3001, async () => {
   const fetch = (await import('node-fetch')).default;
   await fetch('http://localhost:3001/api/login');
   server.close();
});
