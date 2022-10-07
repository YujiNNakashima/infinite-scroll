import express from 'express'
import pg from 'pg'
import cors from 'cors'
import { faker } from '@faker-js/faker';

const app = express()

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

app.get('/comments', async (req, res) => {
  const {page, size} = req.query

  try {
    if(page <= 0) {
      throw Error('page must be bigger than 0')
    }
  
    const { rows } = await pool.query(`
        SELECT * FROM comments
        ORDER BY created_at
        LIMIT $2
        OFFSET (($1 - 1) * $2);
  `, [page, size]);

  const {rows: count}  = await pool.query(`
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

app.post('/comment', async (req, res) => {
  const {
    username,
    commentText
  } = req.body

  try {
    await pool.query('INSERT INTO comments (username, comment_text) VALUES ($1, $2);',
     [username,
      commentText]);

    res.json({
      statusCode: 201,
      text: 'criado!',
      data: {
        username,
        commentText
      }
    })  
    
  } catch (error) {
    res.json({
      statusCode: 500,
      data: 'ops, algo deu errado'
    })
  }
})

app.post('/seed', async (req, res) => {

  const {amount} = req.query

  try {
    for(let i = 0; i < amount; i++) {

      await pool.query('INSERT INTO comments (username, comment_text) VALUES ($1, $2);',
      [faker.name.fullName(),
        faker.lorem.paragraph()]);

    }
    res.json({
      statusCode: 201,
      text: 'criado!',
      amount: `${amount}`
    }) 
  } catch (error) {
    res.json({
      statusCode: 500,
      data: error
    })
  }
})

app.listen(3000, () => console.log('app on 3000'))