import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
export async function createChirp(chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getAllChirps() {
    return await db.query.chirps.findMany();
}
export async function getChirp(id) {
    return await db.query.chirps.findFirst({
        where: (chirps, { eq }) => eq(chirps.id, id),
    });
}
export async function deleteChirp(id) {
    const [result] = await db.delete(chirps)
        .where(eq(chirps.id, id))
        .returning();
    return result;
}
