import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as errors from "../api/errors.js";
import crypto from "crypto";
const SALT_ROUNDS = 10;
const TOKEN_ISSUER = "chirpy";
export async function hashPassword(password) {
    return brcypt.hashSync(password, SALT_ROUNDS);
}
export async function checkPasswordHash(password, hash) {
    return brcypt.compareSync(password, hash);
}
export async function makeJWT(userID, expiresIn, secret) {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: now,
        exp: now + expiresIn,
    }, secret, { algorithm: "HS256" });
}
export async function validateJWT(tokenString, secret) {
    let token;
    try {
        token = jwt.verify(tokenString, secret);
    }
    catch (err) {
        throw new errors.UnauthorizedError("Invalid token");
    }
    if (token.iss !== TOKEN_ISSUER) {
        throw new errors.UnauthorizedError("Invalid issuer");
    }
    if (!token.sub) {
        throw new errors.UnauthorizedError("No user ID in token");
    }
    return token.sub;
}
export async function getBearerToken(req) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        throw new errors.UnauthorizedError("Missing Authorization header");
    }
    if (!authHeader.startsWith("Bearer ")) {
        throw new errors.UnauthorizedError("Missing Bearer token");
    }
    const [bearer, token] = authHeader.split(" ");
    if (!bearer || !token) {
        throw new errors.UnauthorizedError("Missing Bearer token");
    }
    return token;
}
export async function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
export async function getAPIKey(req) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        throw new errors.UnauthorizedError("Missing Authorization header");
    }
    if (!authHeader.startsWith("ApiKey ")) {
        throw new errors.UnauthorizedError("Missing ApiKey");
    }
    const [apiKey, token] = authHeader.split(" ");
    if (!apiKey || !token) {
        throw new errors.UnauthorizedError("Missing ApiKey");
    }
    return token;
}
