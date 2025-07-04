import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirp } from "../db/queries/chirps.js";
import { getUserByUUID } from "../db/queries/users.js";
import { NewChirp } from "../db/schema.js";
import  * as errors from "./errors.js";


function validateChirp(message: string) {
  const maxLength = 140;

  if (message.length > maxLength) {
    throw new errors.BadRequestError(`Chirp is too long. Max length is ${maxLength} characters.`);
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];

  return message.split(" ").map((word: string) => badWords.includes(word.toLowerCase()) ? "****" : word).join(" ")
}

export async function handlerNewChirp(req: Request, res: Response) {
  const chirp: NewChirp = req.body;

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

export async function handlerGetChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();

  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const chirp = await getChirp(req.params.chirpID);

  if (!chirp) {
    throw new errors.NotFoundError("chirp not found");
  }

  respondWithJSON(res, 200, chirp);
}
