import express from "express";
import { handlerReadiness } from "./api/health.js";
import { middlewareLogResponses, middlewareMetricsInc, middlewareError } from "./api/middleware.js";
import { handlerMetrics, handlerMetricsReset } from "./api/metrics.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { appState } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { handlerAddUser, handlerLoginUser, handlerUpdateUsers, handlerUpdateUserChirpyRed } from "./api/users.js";
import { handlerNewChirp, handlerGetChirps, handlerGetChirp, handlerDeleteChirp } from "./api/chirps.js";
import { handlerRefreshAccessToken, handlerRevokeRefreshToken } from "./api/auth.js";
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
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLoginUser(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdateUsers(req, res)).catch(next);
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
app.delete("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});
// Tokens
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefreshAccessToken(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevokeRefreshToken(req, res)).catch(next);
});
// Weebhooks
app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUpdateUserChirpyRed(req, res)).catch(next);
});
// Errors
app.use(middlewareError);
// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
