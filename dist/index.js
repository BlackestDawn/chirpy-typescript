import express from "express";
import { handlerReadiness } from "./api/health.js";
import { middlewareLogResponses } from "./api/status.js";
import { handlerMetrics, handlerMetricsReset, middlewareMetricsInc } from "./api/metrics.js";
import { handlerValidateChirp } from "./api/validate.js";
// setup
const app = express();
const PORT = 8080;
// basics
app.use(middlewareLogResponses);
// metrics routes
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerMetricsReset);
// static files & health check
app.use("/app", middlewareMetricsInc, express.static("./site"));
app.get("/api/healthz", handlerReadiness);
// Validation
app.post("/api/validate_chirp", express.json(), handlerValidateChirp);
// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
