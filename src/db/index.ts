import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { appState } from "../config.js";

const conn = postgres(appState.db.url);
export const db = drizzle(conn, { schema });
