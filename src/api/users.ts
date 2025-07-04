import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import  * as errors from "./errors.js";


export async function handlerAddUser(req: Request, res: Response) {
  const user: NewUser = req.body;

  if (!user || !user.email) {
    throw new errors.BadRequestError("no email found");
  }

  const createdUser = await createUser(user);

  respondWithJSON(res, 201, createdUser);
}
