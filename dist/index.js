import express from "express";
import { handlerReadiness } from "./api/health.js";
import { middlewareLogResponses } from "./api/status.js";
import { handlerMetrics, handlerMetricsReset, middlewareMetricsInc } from "./api/metrics.js";
// setup
const app = express();
const PORT = 8080;
// basics
app.use(middlewareLogResponses);
// metrics routes
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerMetricsReset);
// static files & health check
app.use("/app", middlewareMetricsInc, express.static("./site"));
app.get("/api/healthz", handlerReadiness);
// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
