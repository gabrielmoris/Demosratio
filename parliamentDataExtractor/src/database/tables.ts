import { Logger } from "tslog";
import { writePool } from "./db";

export async function createTables() {
  const client = await writePool.connect();
  const log = new Logger();

  // await client.query(`DROP TABLE IF EXISTS proposal_votes;`);
  // await client.query(`DROP TABLE IF EXISTS proposals;`);
  // await client.query(`DROP TABLE IF EXISTS sources;`);
  // await client.query(`DROP TABLE IF EXISTS promises;`);
  // await client.query(`DROP TABLE IF EXISTS political_parties;`);
  // await client.query(`DROP TABLE IF EXISTS "users";`);

  try {
    // USERS
    await client.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          register_date DATE NOT NULL DEFAULT CURRENT_DATE,
          identity_hash VARCHAR(255) UNIQUE
        );
      `);
    log.info('Table "users" created or already exists.');

    //POLITICAL PARTIES
    await client.query(`
        CREATE TABLE IF NOT EXISTS political_parties (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          logo TEXT,
          abbreviation VARCHAR(50) UNIQUE
        );
      `);
    log.info('Table "political_parties" created or already exists.');

    // SOURCES
    await client.query(`
        CREATE TABLE IF NOT EXISTS sources (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          user_id INTEGER REFERENCES "users"(id),
          source_type VARCHAR(255)
        );
      `);
    log.info('Table "sources" created or already exists.');

    // PROPOSALS
    await client.query(`
        CREATE TABLE IF NOT EXISTS proposals (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          session INTEGER NOT NULL DEFAULT 0,
          expedient_text TEXT,
          votes_parties_json JSONB,
          parliament_presence INTEGER NOT NULL DEFAULT 0,
          votes_for INTEGER NOT NULL DEFAULT 0,
          abstentions INTEGER NOT NULL DEFAULT 0,
          votes_against INTEGER NOT NULL DEFAULT 0,
          likes INTEGER NOT NULL DEFAULT 0,
          dislikes INTEGER NOT NULL DEFAULT 0,
          date TEXT NOT NULL
        );
      `);
    log.info('Table "proposals" created or already exists.');

    // PROMISES
    await client.query(`
        CREATE TABLE IF NOT EXISTS promises (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          url TEXT,
          political_party_id INTEGER REFERENCES political_parties(id) NOT NULL,
          likes INTEGER NOT NULL DEFAULT 0,
          dislikes INTEGER NOT NULL DEFAULT 0,
          date DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
    log.info('Table "promises" created or already exists.');
  } catch (err) {
    log.error("Error creating tables:", err);
    throw err;
  } finally {
    client.release();
  }
}
