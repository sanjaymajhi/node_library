var express = require('express');
var router = express.Router();

var userController=require("../controllers/userController");
var bookController=require("../controllers/bookController");

var auth=require("../auth");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("signup-login");
});
router.post("/signup",userController.signupController);
router.post("/login",userController.loginController);
router.get("/logout",userController.logoutController);

router.get("/books",auth,bookController.book_list);
router.get("/book/:id",auth,bookController.book_detail);

router.get("/:id",auth,userController.profile);
router.post("/:id/update",auth,userController.updateController);

router.get("/:id/borrowed",auth,userController.borrowedController);
module.exports = router;
