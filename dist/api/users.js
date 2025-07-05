import { respondWithJSON } from "./json.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import * as errors from "./errors.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken } from "../lib/auth.js";
import { appState } from "../config.js";
import { addRefreshToken } from "../db/queries/auth.js";
export async function handlerAddUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errors.BadRequestError("no email or password found");
    }
    const createdUser = await createUser({
        email: email,
        hashedPassword: await hashPassword(password),
    });
    respondWithJSON(res, 201, createdUser);
}
export async function handlerLoginUser(req, res) {
    const response = {
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
    response.token = await makeJWT(user.id, appState.jwt.defaultExpireTime, appState.jwt.secret);
    respondWithJSON(res, 200, response);
}
