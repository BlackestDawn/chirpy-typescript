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
