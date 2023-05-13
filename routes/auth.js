const express = require("express");
const router = express.Router();
const UserCtrl=require('../controllers/user');
const authenticate=require('../authmiddle');
const isAdmin=require('../admin')
router.post("/register", UserCtrl.createUser);
router.post("/login", UserCtrl.UserLogin);
router.get("/", isAdmin('admin'),UserCtrl.getAllUsers);
router.put("/:id",authenticate, UserCtrl.updateUser);
router.delete("/:id",isAdmin, UserCtrl.deleteUser);

module.exports = router;