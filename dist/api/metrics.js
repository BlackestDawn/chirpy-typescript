import { appState } from "../config.js";
export async function middlewareMetricsInc(req, res, next) {
    appState.fileserverHits++;
    next();
}
export async function handlerMetrics(req, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(`Hits: ${appState.fileserverHits}`);
    res.end();
}
export async function handlerMetricsReset(req, res) {
    appState.fileserverHits = 0;
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("Hits reset");
    res.end();
}
