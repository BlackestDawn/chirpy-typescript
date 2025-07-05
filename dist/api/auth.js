import { respondWithJSON } from "./json.js";
import * as errors from "./errors.js";
import { appState } from "../config.js";
import { getBearerToken, makeJWT } from "../lib/auth.js";
import { getRefreshTokenByToken, revokeRefreshToken } from "../db/queries/auth.js";
export async function handlerRefreshAccessToken(req, res) {
    const bearerToken = await getBearerToken(req);
    const refreshToken = await getRefreshTokenByToken(bearerToken);
    if (!refreshToken) {
        throw new errors.UnauthorizedError("Invalid refresh token");
    }
    if (refreshToken.revokedAt) {
        throw new errors.UnauthorizedError("Refresh token has been revoked");
    }
    if (refreshToken.expiresAt < new Date()) {
        throw new errors.UnauthorizedError("Refresh token has expired");
    }
    const newToken = await makeJWT(refreshToken.userId, appState.jwt.defaultExpireTime, appState.jwt.secret);
    respondWithJSON(res, 200, { token: newToken });
}
export async function handlerRevokeRefreshToken(req, res) {
    const bearerToken = await getBearerToken(req);
    const result = await revokeRefreshToken(bearerToken);
    if (!result) {
        throw new errors.BadRequestError("Invalid refresh token");
    }
    respondWithJSON(res, 204, "");
}
