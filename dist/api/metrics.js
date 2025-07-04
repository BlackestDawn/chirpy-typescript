import { appState } from "../config.js";
import { resetUsers } from "../db/queries/users.js";
import * as errors from "./errors.js";
export async function handlerMetrics(req, res) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${appState.fileserverHits} times!</p>
  </body>
</html>`);
    res.end();
}
export async function handlerMetricsReset(req, res) {
    if (appState.platform !== "dev") {
        throw new errors.ForbiddenError("Not allowed in this environment.");
    }
    appState.fileserverHits = 0;
    await resetUsers();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("Hits reset");
    res.end();
}
