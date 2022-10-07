const pg = require('pg');

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'infinite_scroll_db',
  user: 'root',
  password: 'root',
});


async function updateTable() {

  const {rows} = await pool.query(`
    SELECT username FROM comments
    WHERE username_id IS NULL
  `)

  rows.forEach(async (item) => {
    await pool.query(`INSERT INTO users (username) VALUES ($1) ON CONFLICT DO NOTHING`,
    [item.username]);
  })

}


try {
  await updateTable()

  console.log('update complete')
} catch (error) {
  console.log(error)
}
