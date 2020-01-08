var express = require('express');
var router = express.Router();

var userController=require("../controllers/userController");
var bookController=require("../controllers/bookController");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("signup-login");
});
router.post("/signup",userController.signupController);
router.post("/login",userController.loginController);

router.get("/books",bookController.book_list);

router.get("/:id",userController.profile);

router.get("/book/:id",bookController.book_detail);

module.exports = router;
