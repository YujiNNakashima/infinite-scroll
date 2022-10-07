/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    CREATE TABLE comments (
      comment_id serial PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      comment_text VARCHAR(500) NOT NULL,
      created_at timestamp default current_timestamp
    );
  `)
};

exports.down = pgm => {
    pgm.sql(`
      DROP TABLE comments;
    `)
};
