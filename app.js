const express = require("express");
const morgan = require("morgan");
const db = require("./db");
const postList = require("./views/postList");
const postDetails = require("./views/postDetails");

const app = express();

app.use(morgan("dev"));
app.use(express.static(__dirname + "/public"));
app.use(require('body-parser').urlencoded({ extended: false }));

app.get('/', (req, res)=> res.redirect('/posts')); 

app.use('/posts', require('./routes'));


const PORT = 1337;

db.seed();

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
