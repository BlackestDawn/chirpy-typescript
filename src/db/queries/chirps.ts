import { eq } from "drizzle-orm";
import { db } from "../index.js"
import { chirps, NewChirp } from "../schema.js"


export async function createChirp(chirp: NewChirp) {
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

export async function getChirp(id: string) {
  return await db.query.chirps.findFirst({
    where: (chirps, { eq }) => eq(chirps.id, id),
  });
}

export async function deleteChirp(id: string) {
  const [result] = await db.delete(chirps)
    .where(eq(chirps.id, id))
    .returning();
  return result;
}

export async function getChirpsByUser(id: string) {
  return await db.query.chirps.findMany({
    where: (chirps, { eq }) => eq(chirps.userId, id),
  });
}
