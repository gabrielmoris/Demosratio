import { Logger } from "tslog";
import { writePool } from "./db";

export async function createTables() {
  const client = await writePool.connect();
  const log = new Logger();

  // await client.query(`DROP TABLE IF EXISTS proposal_votes;`);
  // await client.query(`DROP TABLE IF EXISTS proposal_likes;`);
  // await client.query(`DROP TABLE IF EXISTS proposal_dislikes;`);
  // await client.query(`DROP TABLE IF EXISTS proposals;`);
  // await client.query(`DROP TABLE IF EXISTS sources;`);
  // await client.query(`DROP TABLE IF EXISTS promises;`);
  // await client.query(`DROP TABLE IF EXISTS political_parties;`);
  // await client.query(`DROP TABLE IF EXISTS "user_devices";`);
  // await client.query(`DROP TABLE IF EXISTS "users";`);

  try {
    // USERS
    await client.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255),
          password VARCHAR(255),
          register_date DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
    log.info('Table "users" created or already exists.');

    // USER DEVICES
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_hash VARCHAR(255) UNIQUE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "user_devices" created or already exists.');

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
          date TEXT NOT NULL
        );
      `);
    log.info('Table "proposals" created or already exists.');

    // PROPOSALS LIKES
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposal_likes (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "proposal_likes" created or already exists.');

    // PROPOSALS DISLIKES
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposal_dislikes (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "proposal_dislikes" created or already exists.');

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
