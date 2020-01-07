var express = require('express');
var router = express.Router();

var userController=require("../controllers/userController");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("signup-login");
});
router.post("/signup",userController.signupController);
router.post("/login",userController.loginController);

module.exports = router;
