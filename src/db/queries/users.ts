import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";


export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function resetUsers() {
  return await db.delete(users).returning();
}

export async function getUserByUUID(id: string) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
}

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

export async function updateUser(id: string, user: Partial<NewUser>) {
  const [result] = await db.update(users)
    .set(user)
    .where(eq(users.id, id))
    .returning();
  return result;
}

export async function deleteUser(id: string) {
  const [result] = await db.delete(users)
    .where(eq(users.id, id))
    .returning();
  return result;
}

export async function updateUserToChirpyRed(id: string) {
  const [result] = await db.update(users)
    .set({
      isChirpyRed: true,
    })
    .where(eq(users.id, id))
    .returning();
  return result;
}
