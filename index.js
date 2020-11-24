const express = require("express");
const path = require("path");

const { Pool } = require("pg");
const app = express();

require('dotenv').config();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: "mrdglahjclyphg",
    host: "ec2-54-82-208-124.compute-1.amazonaws.com",
    database: "dd0151lqsm96e1",
    password: "8a7a3b3f6768856a3a9b2c7a20e0cff5c221e955a7f3cbcaa45015538fb48d6a",
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});
console.log("Successful connection to the database");

// Creating the Books table (Book_ID, Title, Author, Comments)
const sql_create = `CREATE TABLE IF NOT EXISTS Books (
    Book_ID SERIAL PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Comments TEXT
);`;
pool.query(sql_create, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of the 'Books' table");
});

// Database seeding
const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
('1', 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
('2', 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
('3', 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne')
ON CONFLICT DO NOTHING;`;
pool.query(sql_insert, [], (err, result) => {
    if (err) {
        return console.error(err.message);
    }
    const sql_sequence = "SELECT SETVAL('Books_Book_ID_Seq', MAX(Book_ID)) FROM Books;";
    pool.query(sql_sequence, [], (err, result) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
    });
});

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => { 
    // res.send("Hello world...");
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
  });

app.get("/data", (req, res) => {
const test = {
    title: "Test",
    items: ["one", "two", "three"]
};
res.render("data", { model: test });
});

app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books ORDER BY Title"
    pool.query(sql, [], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("books", { model: result.rows });
    });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
    if (err) {
        return console.error(err.message);
    }
    res.render("edit", { model: result.rows[0] });
    });
});

app.post("/edit/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = [req.body.Title, req.body.Author, req.body.Comments, id];
    console.log(req.body);
    const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE (Book_ID = $4)";
    pool.query(sql, book, (err, result) => {
    if (err) {
        return console.error(err.message);
    }
    res.redirect("/books");
    });
});

// GET /create
app.get("/create", (req, res) => {
    const book = {
      Author: "Victor Hugo"
    }
    res.render("create", { model: book });
});

// POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
    const book = [req.body.Title, req.body.Author, req.body.Comments];
    pool.query(sql, book, (err, result) => {
    if (err) {
        return console.error(err.message);
    }
      res.redirect("/books");
    });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
    if (err) {
        return console.error(err.message);
    }
      res.render("delete", { model: result.rows[0] });
    });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
    if (err) {
        return console.error(err.message);
    }
      res.redirect("/books");
    });
});