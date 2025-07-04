import { Request, Response } from "express";
import * as errors from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";


export async function handlerValidateChirp(req: Request, res: Response) {
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
      .map((word: string) => badWords.includes(word.toLowerCase()) ? "****" : word)
      .join(" "),
  });
}
