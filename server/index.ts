import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;

    let logLine = `${method} ${path} ${statusCode} in ${duration}ms`;
    if (capturedJsonResponse && path.startsWith("/api")) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }

    log(`${statusCode >= 400 ? '[ERROR]' : '[INFO]'} ${logLine}`);
  });

  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Setup Vite in development or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Global error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

      log(`[ERROR] ${status} - ${message}`);
      if (stack) log(stack);

      res.status(status).json({ 
        error: {
          message,
          ...(stack && { stack })
        }
      });
    });

    // Start server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${port}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          log(`Port ${port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          log(`Port ${port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    log(`[FATAL] Failed to start server: ${error}`);
    process.exit(1);
  }
})();