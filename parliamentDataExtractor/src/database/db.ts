import { Pool } from "pg";
import { Logger } from "tslog"; // If you choose to use tslog

const log = new Logger(); // Optional: tslog logger instance

const dbConfig = {
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "postgres",
  database: process.env.POSTGRES_DB || "demosratio",
  password: process.env.POSTGRES_PASSWORD || "password",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Write/Update/Delete Pool
export const writePool = new Pool({
  ...dbConfig,
});

// Listen Pool
export const listenPool = new Pool({
  ...dbConfig,
});

//Test connection
async function testConnection(pool: Pool, poolName: string) {
  try {
    const client = await pool.connect();
    log.info(`Successfully connected to the ${poolName} database`);
    client.release();
  } catch (err) {
    log.error(`Error connecting to the ${poolName} database:`, err);
    throw err;
  }
}

// Verify Connections
async function verifyConnections() {
  await testConnection(writePool, "writePool");
  await testConnection(listenPool, "listenPool");
}

// Handle pool errors
writePool.on("error", (err: Error) => {
  log.error("Error on writePool: ", err);
});

listenPool.on("error", (err: Error) => {
  log.error("Error on listenPool: ", err);
});

export default verifyConnections;
