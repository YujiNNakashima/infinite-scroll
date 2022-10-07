const pg = require('pg');

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'infinite_scroll_db',
  user: 'root',
  password: 'root',
});


async function updateTable() {
  await pool.query(`
    UPDATE comments 
    SET username_id = (
      SELECT user_id FROM users
      WHERE comments.username = users.username
    )
    WHERE username_id IS NULL
  `)

  console.log('update complete')
}


try {
  updateTable()
} catch (error) {
  console.log(error)
}
