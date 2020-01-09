var validator=require("express-validator");
var bcrypt=require("bcryptjs");
var async=require("async");

var User=require("../models/user");
var Bookinstance=require("../models/bookinstance");

var logged_user=require("../logged_user");

var nodemailer=require("nodemailer");

exports.signupController=[
    
    validator.body("name","Invalid Name").isLength({min:2}),
    validator.body("email","Invalid email").isEmail(),
    validator.body("mobile","Invalid mobile").isLength({min:10,max:10}).isNumeric().withMessage("Inavlid mobile"),
    validator.body("password","Invalid password").isLength({min:8}),

    validator.sanitizeBody("name").escape(),
    validator.sanitizeBody("mobile").escape(),
    validator.sanitizeBody("admin_pass").escape(),

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
        if(admin){
            logged_user.user_logged=0;
        }
        else{
            logged_user.user_logged=1;
        }
         
        var transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:"web.developer.sanjay.majhi@gmail.com",
                pass:"Qwerty12345*"
            }
        })

        var mailoption={
            from:"web.developer.sanjay.majhi@gmail.com",
            to:user.email,
            subject:"Singup successful",
            text:"Welcome "+user.name+" , to our library management website service. Here, you can create books and your library users can take books on loan. Thanks from Sanjay Majhi"
        }
        
        transporter.sendMail(mailoption,(err,info)=>{
            if(err){console.log(err)}
            else{
                console.log("Email sent : "+info.response);
            }
        })
        res.redirect("/users/"+user._id);
    }
];

exports.loginController=[
    
    validator.body("email","Invalid Email").isEmail(),
    validator.body("password","Invalid password").isLength({min:8}),

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
        if(user.admin){
            logged_user.user_logged=0;
        }
        else{
            logged_user.user_logged=1;
        }
        res.redirect("/users/"+user._id);
    }
];

exports.profile=(req,res)=>{
    if(logged_user.user_logged!=2 && req.params.id==logged_user.user_detail._id.toString()){
        res.render("user_index",{title:"Profile Page",user_detail:logged_user.user_detail,user:logged_user.user_detail,user_logged:logged_user.user_logged}) 
    }
    else if(req.params.id!=logged_user.user_detail._id.toString()){
        User.findById(req.params.id).exec((err,result)=>{
            res.render("user_index",{title:"Borrower Profile Page",user_detail:result,user:logged_user.user_detail,user_logged:logged_user.user_logged}) 
        })
    }
    else{
        res.redirect("/users/")
    }
}

exports.updateController=[
    
    validator.body("name","Invalid Name").isLength({min:2}),
    validator.body("email","Invalid email").isEmail(),
    validator.body("mobile","Invalid mobile").isLength({min:10,max:10}).isNumeric().withMessage("Inavlid mobile"),
    validator.body("password","Invalid password").isLength({min:8}),

    validator.sanitizeBody("name").escape(),
    validator.sanitizeBody("mobile").escape(),

    async function(req,res){

        const errors=validator.validationResult(req);

        if(!errors.isEmpty()){
            res.render("user_index",{signup_errors:errors.array(),user:logged_user.user_detail,user_logged:logged_user.user_logged});
            return;
        }

        if(logged_user.user_detail.email!=req.body.email){
            var user=await User.find({email:req.body.email})
            if(user.length){
                res.render("user_index",{usererror:1,user:logged_user.user_detail,user_logged:logged_user.user_logged})
                return;
            };
        }

        if(req.body.admin_pass=="admin"){
            admin=true;
        }
        else if(req.body.admin_pass==""){
            admin=false;
        }

        var user=new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:req.body.password,
            admin:admin,
            _id:req.params.id
        });

        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(user.password,salt);

        await User.findByIdAndUpdate(req.params.id,user,(err,user_detail)=>{
            if(err){console.log(err)}
            
        });
        logged_user.user_detail=user;
        res.redirect("/users/"+logged_user.user_detail._id);
    }
];

exports.logoutController=(req,res)=>{
    if(logged_user.user_logged!=2){
        logged_user.user_detail=null;
        logged_user.user_logged=2;
        res.redirect("/users/");
    }
    else{
        res.redirect("/users/")
    }
}

exports.borrowedController=(req,res)=>{
    var user_books=[];
    if(logged_user.user_logged==1){
        Bookinstance.find({},"book imprint due_back").populate("book").exec((err,results)=>{
            if(err){console.log(err)}
            for(let i=0;i<logged_user.user_detail.books_borrowed.length;i++){
                for(let j=0;j<results.length;j++){
                    
                    if(logged_user.user_detail.books_borrowed[i]==results[j]._id.toString()){
                        user_books.push(results[j]);
                    }
                }
            }
            res.render("books_borrowed",{title:"Books Borrowed",books:user_books,user:logged_user.user_detail,user_logged:logged_user.user_logged})
        })
    }
    else{
        res.redirect("/users/")
    }
}