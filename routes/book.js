const express = require("express");
const router = express.Router();
const {
  sequelize,
  Author,
  Book,
  Genre,
  Publisher,
  User,
  BookAuthor,
  BookGenre,
  UserBook,
} = require("../models/Book");

const authenticate=require('../authmiddle');
const BookCtrl=require('../controllers/book');


router.post("/", authenticate, BookCtrl.createBook);
router.put("/:id", BookCtrl.updateBook);
router.get("/:id", BookCtrl.getOneBook);
router.get("/", BookCtrl.giveBooks);
router.delete("/:id", BookCtrl.deleteBook);

module.exports = router;
