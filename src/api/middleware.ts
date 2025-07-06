import { Request, Response } from "express";
import { appState } from "../config.js";
import { respondWithError } from "./json.js";
import * as errors from "./errors.js";


export const middlewareLogResponses = (req: Request, res: Response, next: any) => {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
};

export async function middlewareMetricsInc(req: Request, res: Response, next: any) {
  appState.fileserverHits++;
  next();
}

export async function middlewareError(err: Error, req: Request, res: Response, next: any) {
  let errCode = 500;
  let errMessage = "Something went wrong on our end";

  if (err instanceof errors.BadRequestError) {
    errCode = 400;
  } else if (err instanceof errors.UnauthorizedError) {
    errCode = 401;
  } else if (err instanceof errors.ForbiddenError) {
    errCode = 403;
  } else if (err instanceof errors.NotFoundError) {
    errCode = 404;
  }
  if (err.message) {
    errMessage = err.message;
  }

  respondWithError(res, errCode, errMessage);
  next();
}
