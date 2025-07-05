import type { MigrationConfig } from "drizzle-orm/migrator";


process.loadEnvFile();

type APIConfig = {
  fileserverHits: number;
  platform: string
  db: DBConfig;
  jwt: {
    secret: string;
    defaultExpireTime: number;
  };
};

type DBConfig = {
  url: string;
  migrations: MigrationConfig;
};

const migrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const appState: APIConfig = {
  fileserverHits: 0,
  platform: envOrThrow("PLATFORM"),
  db: {
    url: envOrThrow("DB_URL"),
    migrations: migrationConfig
  },
  jwt: {
    secret: envOrThrow("JWT_SECRET"),
    defaultExpireTime: 60 * 60,
  },
};

function envOrThrow(key: string): string {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return process.env[key] as string;
}
