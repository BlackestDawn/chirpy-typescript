import * as errors from "./errors.js";
import { respondWithJSON } from "./json.js";
export async function handlerValidateChirp(req, res) {
    const maxLength = 140;
    const chirp = req.body;
    if (!chirp || !chirp.body) {
        throw new Error("Something went wrong");
    }
    if (chirp.body.length > maxLength) {
        throw new errors.BadRequestError(`Chirp is too long. Max length is ${maxLength}`);
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    respondWithJSON(res, 200, {
        cleanedBody: chirp.body.split(" ")
            .map((word) => badWords.includes(word.toLowerCase()) ? "****" : word)
            .join(" "),
    });
}
