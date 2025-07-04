import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirp } from "../db/queries/chirps.js";
import { getUserByUUID } from "../db/queries/users.js";
import * as errors from "./errors.js";
function validateChirp(message) {
    const maxLength = 140;
    if (message.length > maxLength) {
        throw new errors.BadRequestError(`Chirp is too long. Max length is ${maxLength} characters.`);
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    return message.split(" ").map((word) => badWords.includes(word.toLowerCase()) ? "****" : word).join(" ");
}
export async function handlerNewChirp(req, res) {
    const chirp = req.body;
    if (!chirp || !chirp.body) {
        throw new errors.BadRequestError("no message body found");
    }
    chirp.body = validateChirp(chirp.body);
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
