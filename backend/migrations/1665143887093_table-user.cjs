/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(200) NOT NULL
    )
  `)
};

exports.down = pgm => {
  pgm.sql(`
    DROP TABLE users;
  `)
};
