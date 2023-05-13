const express = require("express");
const router = express.Router();
const authenticate=require('../authmiddle');
const BookCtrl=require('../controllers/book');
router.post("/", authenticate, BookCtrl.createBook);
router.put("/:id",authenticate, BookCtrl.updateBook);
router.get("/:id", BookCtrl.getOneBook);
router.get("/", BookCtrl.giveBooks);
router.delete("/:id",authenticate, BookCtrl.deleteBook);

module.exports = router;
