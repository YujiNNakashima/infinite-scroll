/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    ALTER TABLE comments
    DROP COLUMN username;
  `)
};

exports.down = pgm => {
  pgm.sql(`
    ALTER TABLE comments
    ADD COLUMN username VARCHAR(200);
  `)
};
