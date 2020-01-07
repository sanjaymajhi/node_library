var validator=require("express-validator");
var bcrypt=require("bcryptjs");
var jwt=require("jsonwebtoken");
var async=require("async");

var User=require("../models/user");

exports.signupController=[
    
    validator.body("name","Invalid Name").isLength({min:2}),
    validator.body("email","Invalid email").isEmail(),
    validator.body("mobile","Invalid mobile").isLength({min:10,max:10}),
    validator.body("password","Invalid password").isLength({min:8}),

    validator.sanitizeBody("name").escape(),
    validator.sanitizeBody("mobile").escape(),

    async function(req,res){

        const errors=validator.validationResult(req);

        if(!errors.isEmpty()){
            res.render("signup-login",{signup_errors:errors.array()});
            return;
        }

        var user=await User.find({email:req.body.email})
        if(user){
            res.render("signup-login",{usererror:1})
            return;
        };

        var user=new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:req.body.password
        });

        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(user.password,salt);

        await user.save();

        var payload={
            user:{
                id:user._id
            }
        };

        jwt.sign(payload,"randomString",{expiresIn:3600},(err,token)=>{
            if(err){console.log(err)}
            res.status(200).json({token})
        });
    }

];

exports.loginController=function(req,res){
    res.send("login ok");
};