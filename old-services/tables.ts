import { Logger } from "tslog";

export async function createTables() {
  const log = new Logger();

  // console.log(`DROP TABLE IF EXISTS proposal_votes;`);
  // console.log(`DROP TABLE IF EXISTS proposal_likes;`);
  // console.log(`DROP TABLE IF EXISTS proposal_dislikes;`);
  // console.log(`DROP TABLE IF EXISTS proposals;`);
  // console.log(`DROP TABLE IF EXISTS sources;`);
  // console.log(`DROP TABLE IF EXISTS promises;`);
  // console.log(`DROP TABLE IF EXISTS political_parties;`);
  // console.log(`DROP TABLE IF EXISTS "user_devices";`);
  // console.log(`DROP TABLE IF EXISTS "users";`);

  try {
    // USERS
    console.log(`
        CREATE TABLE IF NOT EXISTS "users" (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255),
          password VARCHAR(255),
          register_date DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
    log.info('Table "users" created or already exists.');

    // USER DEVICES
    console.log(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_hash VARCHAR(255) UNIQUE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "user_devices" created or already exists.');

    //POLITICAL PARTIES
    console.log(`
        CREATE TABLE IF NOT EXISTS political_parties (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          logo TEXT,
          abbreviation VARCHAR(50) UNIQUE
        );
      `);
    log.info('Table "political_parties" created or already exists.');

    // SOURCES
    console.log(`
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
    console.log(`
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
          no_vote INTEGER NOT NULL DEFAULT 0,
          assent BOOLEAN,
          date DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
    log.info('Table "proposals" created or already exists.');

    // PROPOSALS LIKES
    console.log(`
      CREATE TABLE IF NOT EXISTS proposal_likes (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "proposal_likes" created or already exists.');

    // PROPOSALS DISLIKES
    console.log(`
      CREATE TABLE IF NOT EXISTS proposal_dislikes (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log.info('Table "proposal_dislikes" created or already exists.');

    // PROMISES
    console.log(`
        CREATE TABLE IF NOT EXISTS promises (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          url TEXT,
          political_party_id INTEGER REFERENCES political_parties(id) NOT NULL,
          date DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
    log.info('Table "promises" created or already exists.');

    // PROMISE REACHED
    console.log(`
        CREATE TABLE IF NOT EXISTS promises_status_reached (
            id SERIAL PRIMARY KEY,
            promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    log.info('Table "promises_status_reached" created or already exists.');

    // PROMISE NOT REACHED
    console.log(`
        CREATE TABLE IF NOT EXISTS promises_status_not_reached (
            id SERIAL PRIMARY KEY,
            promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    log.info('Table "promises_status_not_reached" created or already exists.');
  } catch (err) {
    log.error("Error creating tables:", err);
    throw err;
  }
}
