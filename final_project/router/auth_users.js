const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // returns true if the username is not already taken
  let validators = users.filter((user) => {
    return user.username === username;
  });
  return validators.length === 0;
};

const authenticatedUser = (username, password) => {
  // returns true if username and password match a registered user
  let validators = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validators.length > 0;
};

// Task 7: only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Error logging in. Provide username and password." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 },
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res
      .status(401)
      .json({ message: "Invalid login. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res
      .status(400)
      .json({ message: "Please provide a review as a query parameter" });
  }

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).json({
      message: `Review for ISBN ${isbn} added/updated successfully`,
      reviews: book.reviews,
    });
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

// Task 9: Delete a book review (only the logged-in user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({
        message: `Review for ISBN ${isbn} deleted successfully`,
        reviews: book.reviews,
      });
    } else {
      return res
        .status(404)
        .json({ message: "No review by this user to delete" });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;