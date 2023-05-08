const express = require("express");
const router = express.Router();
const UserCtrl=require('../controllers/user');
const authenticate=require('../authmiddle');
const isAdmin=require('../isadmin')

router.post("/register", UserCtrl.createUser);
router.post("/login", UserCtrl.UserLogin);
router.put("/:id",authenticate, UserCtrl.updateUser);
router.delete("/:id",isAdmin, UserCtrl.deleteUser);
router.get("/", isAdmin,UserCtrl.getAllUsers);



module.exports = router;