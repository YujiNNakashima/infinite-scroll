/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    ALTER TABLE comments
    ADD COLUMN username_id INTEGER REFERENCES users(user_id);
  `)
};

exports.down = pgm => {
  pgm.sql(`
    ALTER TABLE comments
    DROP COLUMN username_id;
  `)
};
