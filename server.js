// Production server for IIS deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false; // Always production for IIS
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, closing server gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
