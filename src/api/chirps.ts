import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirp, deleteChirp, getChirpsByUser } from "../db/queries/chirps.js";
import { getUserByUUID } from "../db/queries/users.js";
import { NewChirp, Chirp } from "../db/schema.js";
import  * as errors from "./errors.js";
import { appState } from "../config.js";
import { getBearerToken, validateJWT } from "../lib/auth.js";


function validateChirp(message: string) {
  const maxLength = 140;

  if (message.length > maxLength) {
    throw new errors.BadRequestError(`Chirp is too long. Max length is ${maxLength} characters.`);
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];

  return message.split(" ").map((word: string) => badWords.includes(word.toLowerCase()) ? "****" : word).join(" ")
}

async function validateUser(req: Request) {
  const token = await getBearerToken(req);
  const userID = validateJWT(token, appState.jwt.secret);
  return userID;
}


export async function handlerNewChirp(req: Request, res: Response) {
  const chirp: NewChirp = req.body;

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

  const createdChirp = await createChirp(chirp satisfies NewChirp);

  respondWithJSON(res, 201, createdChirp);
}

export async function handlerGetChirps(req: Request, res: Response) {
  const authorIdQuery = req.query.authorId;
  const sortQuery = req.query.sort;
  const authorId = authorIdQuery ? String(authorIdQuery) : undefined;
  const sort = sortQuery ? String(sortQuery) : "asc";

  let result: Chirp[];

  if (authorId) {
    result = await getChirpsByUser(authorId);
  } else {
    result = await getAllChirps();
  }
  respondWithJSON(res, 200, result.sort((a, b) => {
    if (sort === "asc") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  }));
}

export async function handlerGetChirp(req: Request, res: Response) {
  const chirp = await getChirp(req.params.chirpID);

  if (!chirp) {
    throw new errors.NotFoundError("chirp not found");
  }

  respondWithJSON(res, 200, chirp satisfies Chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
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
