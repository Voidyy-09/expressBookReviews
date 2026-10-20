const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ---------------------------------------------------------------
// Task 6: Register a new user
// ---------------------------------------------------------------
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const userExists = users.some((user) => user.username === username);
    if (!userExists) {
      users.push({ username: username, password: password });
      return res
        .status(201)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({
    message:
      "Unable to register user. Please provide both username and password.",
  });
});

// ---------------------------------------------------------------
// Task 1: Get the book list available in the shop
// ---------------------------------------------------------------
public_users.get("/", function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// ---------------------------------------------------------------
// Task 2: Get book details based on ISBN
// ---------------------------------------------------------------
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ---------------------------------------------------------------
// Task 3: Get book details based on author
// ---------------------------------------------------------------
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];
  for (const bookId in books) {
    if (books[bookId].author === author) {
      booksByAuthor.push(books[bookId]);
    }
  }
  if (booksByAuthor.length > 0) {
    return res.json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// ---------------------------------------------------------------
// Task 4: Get book details based on title
// ---------------------------------------------------------------
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];
  for (const bookId in books) {
    if (books[bookId].title === title) {
      booksByTitle.push(books[bookId]);
    }
  }
  if (booksByTitle.length > 0) {
    return res.json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// ---------------------------------------------------------------
// Task 5: Get book reviews
// ---------------------------------------------------------------
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    return res.json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for this book" });
  }
});

// ===============================================================
// Tasks 10-13: Same functionality using async/await with Axios
// (these call the synchronous routes above over HTTP)
// ===============================================================

// Task 10: Get all books using async/await with Axios
public_users.get("/async/books", async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details by ISBN using async/await with Axios
public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res
      .status(err.response ? err.response.status : 500)
      .json({ message: "Book not found" });
  }
});

// Task 12: Get books by author using async/await with Axios
public_users.get("/async/author/:author", async function (req, res) {
  try {
    const response = await axios.get(
      `${BASE_URL}/author/${encodeURIComponent(req.params.author)}`,
    );
    return res.status(200).json(response.data);
  } catch (err) {
    return res
      .status(err.response ? err.response.status : 500)
      .json({ message: "No books found by this author" });
  }
});

// Task 13: Get books by title using async/await with Axios
public_users.get("/async/title/:title", async function (req, res) {
  try {
    const response = await axios.get(
      `${BASE_URL}/title/${encodeURIComponent(req.params.title)}`,
    );
    return res.status(200).json(response.data);
  } catch (err) {
    return res
      .status(err.response ? err.response.status : 500)
      .json({ message: "No books found with this title" });
  }
});

module.exports.general = public_users;