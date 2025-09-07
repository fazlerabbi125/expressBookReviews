const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const userFound = users.find((elem)=>elem?.username===username);
    return !userFound;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const {username='', password=''} = req.body;
    if (!username || !password) {
        return res.status(422).json({ message: "Username/password is missing" });
    }
    // Authenticate user
    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ message: "Invalid Login. Check username and password" });
    }
    const accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  isbn = req.params.isbn;
  const username = req.session?.authorization?.username;
  if (!username){
    return res.status(401).json({message: "You are not authenticated to make this request."})
  }
  const review_text = req.body.review_text;
  if (!review_text){
    return res.status(422).json({message: "You need to add text for your review"})
  }
  const book = books?.[isbn];
  if (!book){
    return res.status(404).json({message: "Book not found"})
  }
  book.reviews[username] = review_text;
  return res.json({message: "Review added / modified successfully.", result: book});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    isbn = req.params.isbn;
    const username = req.session?.authorization?.username;
    if (!username){
        return res.status(401).json({message: "You are not authenticated to make this request."})
    }
    const book = books?.[isbn];
    if (!book){
        return res.status(404).json({message: "Book not found"})
    }
    if (!book.reviews[username]){
        return res.status(404).json({message: "Review by user not found on this book"})
    }
    delete book.reviews[username];
    return res.json({message: "Review successfully deleted."});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
