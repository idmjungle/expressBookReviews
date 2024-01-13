const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.username;
  let isbn = req.params.isbn;
  let text = req.body.review;
  let book = books[isbn];


  if (book) {
    if (book.reviews[user]) {
        book.reviews[user] = text;
        res.send({
            "data": book,
            "status":`${user}'s review edited!`
        });
    } else {
        book.reviews[user] = text;
        res.send({
            "data": book,
            "status":`${user}'s review added!`
        });
    }
    console.log(book);
    
} else {
    res.send("No book");
    
}


  
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.username;
  let isbn = req.params.isbn;
  let text = req.body.review;
  let book = books[isbn];
  let review = JSON.stringify(book.reviews);

  if (book) {
    if (book.reviews[user]) {
        review = JSON.parse(review);
        delete book.reviews[user]; 
        res.send({
            "data": book,
            "status":`${user}'s review delete!`
        });
    } else {
        res.send({
            "status":`No ${user}'s review to delete`
        });
    }
    console.log(book);
    
} else {
    res.send("No book");
}
  
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
