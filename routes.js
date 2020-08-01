const express = require("express");
const db = require("./db");
const postList = require("./views/postList");
const postDetails = require("./views/postDetails");
const addPost = require("./views/addPost");

const app = express.Router();

module.exports = app;

const baseQuery = "SELECT posts.*, users.name, counting.upvotes FROM posts INNER JOIN users ON users.id = posts.userId LEFT JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) AS counting ON posts.id = counting.postId\n";

app.get("/", async (req, res, next) => {
  try {
    const data = await db.client.query(baseQuery);
    res.send(postList(data.rows));
  } catch (error) { next(error) }
});

app.post('/', async(req, res, next)=> {
  try {
    let response = await db.client.query(`
      SELECT *
      FROM users
      WHERE name = $1
    `, [req.body.name]);
    if(response.rows.length){
      response = await db.client.query(`
        INSERT INTO posts(title, content, userId) values($1, $2, $3) RETURNING *;
      `, [ req.body.title, req.body.content, response.rows[0].id]);
      res.redirect(`/posts/${response.rows[0].id}`);
    }
    else {
      response = await db.client.query(`
        INSERT INTO users(name) values($1) RETURNING *; 
      `, [ req.body.name]);
      response = await db.client.query(`
        INSERT INTO posts(title, content, userId) values($1, $2, $3) RETURNING *;
      `, [ req.body.title, req.body.content, response.rows[0].id]);
      res.redirect(`/posts/${response.rows[0].id}`);

    }
  }
  catch(ex){
    next(ex);
  }
});

app.get("/add", (req, res, next) => {
    res.send(addPost());
});

app.get("/:id", async (req, res, next) => {
  try {
    const data = await db.client.query(baseQuery + "WHERE posts.id = $1", [req.params.id]);
    const post = data.rows[0];
    res.send(postDetails(post));
  } catch (error) { next(error) }
});
