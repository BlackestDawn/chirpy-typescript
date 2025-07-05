import { db, } from "../index.js";
import { refresh_tokens } from "../schema.js";
import { eq } from "drizzle-orm";
export async function addRefreshToken(token, userId, expiresAt) {
    const [result] = await db.insert(refresh_tokens).values({
        token,
        userId,
        expiresAt,
    }).returning();
    return result;
}
export async function getRefreshTokenByUserID(id) {
    return await db.query.refresh_tokens.findFirst({
        where: (refresh_tokens, { eq }) => eq(refresh_tokens.userId, id),
    });
}
export async function getRefreshTokenByToken(token) {
    return await db.query.refresh_tokens.findFirst({
        where: (refresh_tokens, { eq }) => eq(refresh_tokens.token, token),
    });
}
export async function revokeRefreshToken(token) {
    return await db.update(refresh_tokens).set({
        revokedAt: new Date(),
    }).where(eq(refresh_tokens.token, token)).returning();
}
