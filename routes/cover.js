
const express = require("express");
const router = express.Router();
const coverCtrl=require('../controllers/cover')
router.get('/:id',coverCtrl.getCover);
module.exports=router 