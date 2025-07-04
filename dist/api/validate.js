import { respondWithError, respondWithJSON } from "./json.js";
export async function handlerValidateChirp(req, res) {
    const chirp = req.body;
    if (!chirp || !chirp.body) {
        respondWithError(res, 400, "Something went wrong");
        return;
    }
    if (chirp.body.length > 140) {
        respondWithError(res, 400, "Chirp is too long");
        return;
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    respondWithJSON(res, 200, {
        cleanedBody: chirp.body.split(" ")
            .map((word) => badWords.includes(word.toLowerCase()) ? "****" : word)
            .join(" "),
    });
}
