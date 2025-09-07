const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const {username='', password=''} = req.body;
  if (!username||!password){
    return res.status(422).send({message: "Username/password is missing"});
  }
  if (!isValid(username)){
    return res.status(400).send({message: "User with identical username found."});
  }
  const newUser = {username, password}
  users.push(newUser)
  return res.json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  const awaited_books = await Promise.resolve(books)
  res.send(JSON.stringify(awaited_books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  isbn = req.params.isbn;
  const book = (await Promise.resolve(books))?.[isbn];
  if (!book){
    return res.status(404).json({message: "Book not found"})
  }
  return res.send(book);
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const author = req.params.author;
  const result = []
  const awaited_books = await Promise.resolve(books)
  for (const bookId of Object.keys(awaited_books)){
    if (books[bookId]?.author===author){
        result.push(books[bookId])
    }
  }
  if (result.length==0){
    return res.status(404).json({message: "No book found with this author"});
  }
  return res.json(result)
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  const title = req.params.title;
  const awaited_books = await Promise.resolve(books)
  for (const bookId of Object.keys(awaited_books)){
    if (books[bookId]?.title===title){
        return res.send(books[bookId])
    }
  }
  return res.status(404).json({message: "No book found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  isbn = req.params.isbn;
  const book = books?.[isbn];
  if (!book){
    return res.status(404).json({message: "Book not found"})
  }
  return res.json(book.reviews);
});

module.exports.general = public_users;
