var validator=require("express-validator");
var bcrypt=require("bcryptjs");
var async=require("async");

var User=require("../models/user");

var logged_user=require("../logged_user");

exports.signupController=[
    
    validator.body("name","Invalid Name").isLength({min:2}),
    validator.body("email","Invalid email").isEmail(),
    validator.body("mobile","Invalid mobile").isLength({min:10,max:10}).isNumeric().withMessage("Inavlid mobile"),
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
        if(user.length){
            res.render("signup-login",{usererror:1})
            return;
        };

        if(req.body.admin_pass=="admin"){
            admin=true;
        }
        else if(req.body.admin_pass==""){
            admin=false;
        }
        else{
            res.render("signup-login",{adminerror:1})
        }

        var user=new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:req.body.password,
            admin:admin
        });

        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(user.password,salt);

        await user.save((err)=>{
            if(err){throw err}
            
        });
        logged_user.user_detail=user;
        if(admin==false){
            logged_user.user_logged=1;
        }
        res.redirect("/users/"+user._id);
    }
];

exports.loginController=[
    
    validator.body("email","Invalid Email").isEmail(),
    validator.body("password").isLength({min:8}),

    async (req,res)=>{

        const errors=validator.validationResult(req);

        if(!errors.isEmpty()){
            res.render("signup-login",{login_errors:errors.array()});
            return;
        }

        var user=await User.findOne({email:req.body.email});
        if(!user){
            res.render("signup-login",{usererror_l:1});
            return;
        }
        const isMatch=await bcrypt.compare(req.body.password,user.password);
        if(!isMatch){
            res.render("signup-login",{matcherror:1});
            return;
        }
        logged_user.user_detail=user;
        if(user.admin==false){
            logged_user.user_logged=1;
        }
        
        res.redirect("/users/"+user._id);
        
    }
];

exports.profile=(req,res)=>{
    res.render("user_index",{title:"Profile Page",user:logged_user.user_detail,user_logged:logged_user.user_logged}) 
}
