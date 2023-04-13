import express, { Express, Request, Response } from 'express';
import pg from 'pg'
import cors from 'cors'
import { faker } from '@faker-js/faker';

const app: Express = express()

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'infinite_scroll_db',
  user: 'root',
  password: 'root',
});

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));

type CommentsQueryParams = { page: number, size: number }

app.get('/comments', async (req: Request, res: Response) => {
  const { page, size } = req.query as unknown as CommentsQueryParams

  try {
    if (page <= 0) {
      throw Error('page must be bigger than 0')
    }

    const { rows } = await pool.query(`
        SELECT comment_text, users.username FROM comments c
        JOIN users ON c.username_id = users.user_id
        ORDER BY created_at
        LIMIT $2
        OFFSET (($1 - 1) * $2);
  `, [page, size]);

    const { rows: count } = await pool.query(`
    SELECT COUNT(*) FROM comments;
  `)

    res.status(200).json({
      total: count[0].count,
      currentPage: page,
      totalPages: Math.ceil(count[0].count / size),
      hasNextPage: page <= Math.ceil(count[0].count / size) ? true : false,
      data: rows
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      data: 'ops, algo deu errado'
    })
  }


})

app.post('/comment', async (req: Request, res: Response) => {
  const {
    username,
    commentText
  } = req.body

  try {
    const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [username])

    if (user.rows.length <= 0) {
      console.log('não achou usuário')
      await pool.query(`INSERT INTO users (username) VALUES($1)`, [username])
    }
    const { rows } = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username])
    await pool.query('INSERT INTO comments (username, comment_text, username_id) VALUES ($1, $2, $3);',
      [username,
        commentText, rows[0].username_id]);

    res.json({
      statusCode: 201,
      text: 'criado!',
      data: {
        username,
        commentText
      }
    })

  } catch (error) {
    console.log(error)
    res.json({
      statusCode: 500,
      data: 'ops, algo deu errado'
    })
  }
})

app.post('/seed', async (req: Request, res: Response) => {

  const { amount } = req.query

  try {
    for (let i = 0; i < Number(amount); i++) {

      pool.query(`BEGIN`)
      const username = faker.name.fullName()
      const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [username])

      if (user.rows.length <= 0) {
        await pool.query(`INSERT INTO users (username) VALUES($1)`, [username])
      }

      const userId = await pool.query('SELECT username, user_id FROM users WHERE username = $1',
        [username]);

      await pool.query('INSERT INTO comments (comment_text, username_id) VALUES ($1, $2);',
        [faker.lorem.paragraph(), userId.rows[0].user_id]);

    }

    pool.query('COMMIT')
    res.json({
      statusCode: 201,
      text: 'criado!',
      amount: `${amount}`
    })
  } catch (error) {
    pool.query(`ROLLBACK`)

    res.json({
      statusCode: 500,
      data: error
    })
  }
})

app.listen(3000, () => console.log('app on 3000'))