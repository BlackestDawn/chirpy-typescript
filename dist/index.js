import express from "express";
import { handlerReadiness } from "./api/health.js";
import { middlewareLogResponses, middlewareMetricsInc, middlewareError } from "./api/middleware.js";
import { handlerMetrics, handlerMetricsReset } from "./api/metrics.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { appState } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { handlerAddUser } from "./api/users.js";
import { handlerNewChirp, handlerGetChirps, handlerGetChirp } from "./api/chirps.js";
// DB migration
const migrationClient = postgres(appState.db.url, { max: 1 });
await migrate(drizzle(migrationClient), appState.db.migrations);
// setup
const app = express();
const PORT = 8080;
// basics
app.use(middlewareLogResponses);
app.use(express.json());
// metrics routes
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerMetricsReset);
// static files & health check
app.use("/app", middlewareMetricsInc, express.static("./site"));
app.get("/api/healthz", handlerReadiness);
// Users
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerAddUser(req, res)).catch(next);
});
// Chirps
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerNewChirp(req, res)).catch(next);
});
app.get("/api/chirps", (_, res, next) => {
    Promise.resolve(handlerGetChirps(_, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetChirp(req, res)).catch(next);
});
// Errors
app.use(middlewareError);
// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
