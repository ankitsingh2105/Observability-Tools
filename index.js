const express = require("express");
const responseTime = require("response-time");
const client = require("prom-client");
const { doSomeHeavyTask } = require("./utils"); // Replace with actual task or dummy

const app = express();
const PORT = process.env.PORT || 8000;

const { createLogger, format } = require("winston");
const LokiTransport = require("winston-loki");

// ✅ Fixed logger config (removed invalid `route` key)
const logger = createLogger({
  format: format.json(),
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100",
      labels: { job: "express-app" },
      json: true,
      format: format.json(),
      handleExceptions: true,
      replaceTimestamp: true,
    }),
  ],
});

// ✅ Create custom Prometheus registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ✅ Histogram for request duration
const reqResTime = new client.Histogram({
  name: "custom_http_request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
});

// ✅ Counter for total requests
const requestCounter = new client.Counter({
  name: "custom_total_request_counter",
  help: "Total request count",
  labelNames: ["method", "route"],
});

register.registerMetric(reqResTime);
register.registerMetric(requestCounter);

// ✅ Middleware for Prometheus + Loki route-specific logging
const monitoredRoutes = ["/", "/slow"];

app.use(
  responseTime((req, res, time) => {
    if (req.url === "/metrics") return;

    const route = req.route?.path || req.path;
    requestCounter.labels(req.method, route).inc();
    reqResTime.labels(req.method, route, res.statusCode).observe(time / 1000);

    // ✅ Only log for specific routes
    if (monitoredRoutes.includes(route)) {
      logger.info(`Request to ${route}`, {
        method: req.method,
        status: res.statusCode,
        duration: time.toFixed(2),
      });
    }
  })
);

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/slow", async (req, res) => {
  try {
    const timeTaken = await doSomeHeavyTask(); // Simulate heavy task
    logger.info("Heavy task done successfully");
    res.json({
      status: "Success",
      message: `Heavy task completed in ${timeTaken}ms`,
    });
  } catch (error) {
    logger.error("Some error in heavy task");
    res.status(500).json({
      status: "Error",
      error: "Internal Server Error",
    });
  }
});

// ✅ Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
