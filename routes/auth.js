const authenticate=require('../authmiddle');
const BookCtrl=require('../controllers/book');
router.put("/:id", UserCtrl.updateUser);
router.get("/:id", UserCtrl.getOneUser);
router.get("/", UserCtrl.createUser);