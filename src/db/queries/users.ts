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
