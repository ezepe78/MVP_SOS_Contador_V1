import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // The actual SOS Contador API URL. This should be configured in the environment.
  // We default to the most likely known subdomains.
  const targetApi = process.env.SOS_API_URL || 'https://api.sos-contador.com/api-comunidad';
  
  console.log(`Setting up API proxy to target: ${targetApi}`);

  // Mapeamos /api local a /api-comunidad en el servidor real.
  // Express elimina /api del path y el proxy lo añade al target.
  app.use('/api', createProxyMiddleware({
    target: targetApi,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }, // Eliminamos /api para que se añada al base URL del target
    onProxyReq: (proxyReq, req) => {
        // Log outgoing proxy requests for debugging
        console.log(`[PROXY] Incoming: ${req.method} ${req.url}`);
        console.log(`[PROXY] Forwarding to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req) => {
        console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[PROXY ERROR]', err);
        res.status(502).json({ error: 'Error de conexión con la API de SOS Contador.', details: err.message });
    }
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Basic static serving for production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
    console.error("Failed to start server", err);
});
