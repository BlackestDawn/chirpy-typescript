process.loadEnvFile();
const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
export const appState = {
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
function envOrThrow(key) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return process.env[key];
}
