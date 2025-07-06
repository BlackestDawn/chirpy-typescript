import { respondWithJSON } from "./json.js";
import { createUser, getUserByEmail, getUserByUUID, updateUser, updateUserToChirpyRed } from "../db/queries/users.js";
import * as errors from "./errors.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken, validateJWT, getBearerToken, getAPIKey } from "../lib/auth.js";
import { appState } from "../config.js";
import { addRefreshToken } from "../db/queries/auth.js";
export async function handlerAddUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errors.BadRequestError("no email or password found");
    }
    const { hashedPassword, ...createdUser } = await createUser({
        email: email,
        hashedPassword: await hashPassword(password),
    });
    respondWithJSON(res, 201, createdUser);
}
export async function handlerLoginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errors.UnauthorizedError("invalid username or password");
    }
    const user = await getUserByEmail(email);
    if (!user) {
        throw new errors.UnauthorizedError("invalid username or password");
    }
    const response = {
        token: "",
        refreshToken: "",
        email: email,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
    };
    if (!checkPasswordHash(password, user.hashedPassword)) {
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
export async function handlerUpdateUsers(req, res) {
    const { email, password } = req.body;
    const bearerToken = await getBearerToken(req);
    const userID = await validateJWT(bearerToken, appState.jwt.secret);
    const user = await getUserByUUID(userID);
    if (!user) {
        throw new errors.UnauthorizedError("invalid username");
    }
    const newPassword = await hashPassword(password);
    const { hashedPassword, ...updatedUser } = await updateUser(userID, {
        email: email,
        hashedPassword: newPassword,
    });
    respondWithJSON(res, 200, updatedUser);
}
export async function handlerUpdateUserChirpyRed(req, res) {
    const apiKey = await getAPIKey(req);
    if (apiKey !== appState.apiConfig.polka.webhookSecret) {
        throw new errors.UnauthorizedError("invalid webhook secret");
    }
    const { event, data } = req.body;
    if (event !== "user.upgraded") {
        respondWithJSON(res, 204, "");
        return;
    }
    const result = await updateUserToChirpyRed(data.userId);
    if (!result) {
        throw new errors.NotFoundError("user not found");
    }
    respondWithJSON(res, 204, "");
}
