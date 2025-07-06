import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirp, deleteChirp } from "../db/queries/chirps.js";
import { getUserByUUID } from "../db/queries/users.js";
import * as errors from "./errors.js";
import { appState } from "../config.js";
import { getBearerToken, validateJWT } from "../lib/auth.js";
function validateChirp(message) {
    const maxLength = 140;
    if (message.length > maxLength) {
        throw new errors.BadRequestError(`Chirp is too long. Max length is ${maxLength} characters.`);
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    return message.split(" ").map((word) => badWords.includes(word.toLowerCase()) ? "****" : word).join(" ");
}
async function validateUser(req) {
    const token = await getBearerToken(req);
    const userID = validateJWT(token, appState.jwt.secret);
    return userID;
}
export async function handlerNewChirp(req, res) {
    const chirp = req.body;
    if (!chirp || !chirp.body) {
        throw new errors.BadRequestError("no message body found");
    }
    chirp.body = validateChirp(chirp.body);
    chirp.userId = await validateUser(req);
    if (!chirp.userId) {
        throw new errors.BadRequestError("no user id found");
    }
    const user = await getUserByUUID(chirp.userId);
    if (!user) {
        throw new errors.NotFoundError("user not found");
    }
    const createdChirp = await createChirp(chirp);
    respondWithJSON(res, 201, createdChirp);
}
export async function handlerGetChirps(req, res) {
    const chirps = await getAllChirps();
    respondWithJSON(res, 200, chirps);
}
export async function handlerGetChirp(req, res) {
    const chirp = await getChirp(req.params.chirpID);
    if (!chirp) {
        throw new errors.NotFoundError("chirp not found");
    }
    respondWithJSON(res, 200, chirp);
}
export async function handlerDeleteChirp(req, res) {
    const chirp = await getChirp(req.params.chirpID);
    if (!chirp) {
        throw new errors.NotFoundError("chirp not found");
    }
    const token = await getBearerToken(req);
    const userID = await validateJWT(token, appState.jwt.secret);
    if (userID !== chirp.userId) {
        throw new errors.ForbiddenError("you are not authorized to delete this chirp");
    }
    const result = await deleteChirp(chirp.id);
    if (!result) {
        throw new Error("something went wrong deleting the chirp");
    }
    respondWithJSON(res, 204, "");
}
