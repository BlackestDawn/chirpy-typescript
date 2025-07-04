import { appState } from "../config.js";
import { respondWithError } from "./json.js";
import * as errors from "./errors.js";
export const middlewareLogResponses = (req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
};
export async function middlewareMetricsInc(req, res, next) {
    appState.fileserverHits++;
    next();
}
export async function middlewareError(err, req, res, next) {
    let errCode = 500;
    let errMessage = "Something went wrong on our end";
    if (err instanceof errors.BadRequestError) {
        errCode = 400;
        errMessage = err.message;
    }
    else if (err instanceof errors.UnauthorizedError) {
        errCode = 401;
        errMessage = err.message;
    }
    else if (err instanceof errors.ForbiddenError) {
        errCode = 403;
        errMessage = err.message;
    }
    else if (err instanceof errors.NotFoundError) {
        errCode = 404;
        errMessage = err.message;
    }
    respondWithError(res, errCode, errMessage);
    next();
}
