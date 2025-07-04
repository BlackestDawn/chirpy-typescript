import { Request, Response } from "express";
import { appState } from "../config.js";


export async function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${appState.fileserverHits} times!</p>
  </body>
</html>`);
  res.end();
}

export async function handlerMetricsReset(req: Request, res: Response) {
  appState.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("Hits reset");
  res.end();
}
