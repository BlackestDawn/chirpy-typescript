import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createUser, getUserByEmail, getUserByUUID, updateUser } from "../db/queries/users.js";
import { NewUser, User } from "../db/schema.js";
import  * as errors from "./errors.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken, validateJWT, getBearerToken } from "../lib/auth.js";
import { appState } from "../config.js";
import { addRefreshToken, getRefreshTokenByUserID } from "../db/queries/auth.js";


type ResponseUser = Omit<User, "hashedPassword"> & {
  password: string;
  token: string;
  refreshToken: string;
};

export async function handlerAddUser(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new errors.BadRequestError("no email or password found");
  }

  const createdUser = await createUser({
    email: email,
    hashedPassword: await hashPassword(password),
  } satisfies NewUser);

  respondWithJSON(res, 201, createdUser);
}

export async function handlerLoginUser(req: Request, res: Response) {
  const response: ResponseUser = {
    ...req.body,
    token: "",
    refreshToken: "",
  };

  if (!response.email || !response.password) {
    throw new errors.UnauthorizedError("invalid username or password");
  }

  const user = await getUserByEmail(response.email);

  if (!user) {
    throw new errors.UnauthorizedError("invalid username or password");
  }

  response.id = user.id;
  response.createdAt = user.createdAt;
  response.updatedAt = user.updatedAt;
  if (!checkPasswordHash(response.password, user.hashedPassword)) {
    throw new errors.UnauthorizedError("invalid username or password");
  }

  response.refreshToken = await makeRefreshToken();
  const resultToken = await addRefreshToken(response.refreshToken, user.id, new Date(Date.now() + 1000 * 60 * 60 * 24 * 60));
  if (!resultToken) {
    throw new Error("failed to create refresh token");
  }
  response.token = await makeJWT(user.id, appState.jwt.defaultExpireTime, appState.jwt.secret)

  respondWithJSON(res, 200, response);
}

export async function handlerUpdateUsers(req: Request, res: Response) {
  const { email, password } = req.body;
  const bearerToken = await getBearerToken(req);
  const userID = await validateJWT(bearerToken, appState.jwt.secret);
  const user = await getUserByUUID(userID);

  if (!user) {
    throw new errors.UnauthorizedError("invalid username");
  }
  const newPassword = await hashPassword(password);
  const {hashedPassword, ...updatedUser} = await updateUser(userID, {
    email: email,
    hashedPassword: newPassword,
  });

  respondWithJSON(res, 200, updatedUser);
}
