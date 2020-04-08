var bookinstance=require("../models/bookinstance");
var book=require("../models/book");
var User=require("../models/user");
var validator=require("express-validator");
var async=require("async");

var nodemailer=require("nodemailer");

exports.bookinstance_list=function(req,res){
    if(req.user_logged!=2){
        bookinstance.find({},"book imprint status due_back").populate('book')
        .exec((err,list)=>{
            if(err){return next(err);}
            res.render("bookinstance_list",{title:"Book Instance List",errors:err,bookinstances:list,user:req.user_detail,user_logged:req.user_logged});
        })
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_detail=function(req,res){
    if(req.user_logged!=2){
        bookinstance.findById(req.params.id).populate("book").populate("borrowed_by").exec((err,result)=>{
            if(err){console.log(err)}
            res.render("book_instance_detail",{title:"Book Instance Detail",detail:result,user:req.user_detail,user_logged:req.user_logged});
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_create_get=function(req,res,next){
    if(req.user_logged==0){
        book.find().exec((err,results)=>{
            if(err){return next(err);}
            res.render("bookinstance_form",{title:"Book Instance Form",books:results,user:req.user_detail,user_logged:req.user_logged});
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_create_post=[

    validator.body("book","book cannot be empty").isLength({min:1}).trim(),
    validator.body("imprint","imprint cannot be empty").isLength({min:1}).trim().isAlphanumeric().withMessage("You cannot enter non alphanumeric characters."),
    validator.body("due_back","invalid date").optional({checkFalsy:true}).isISO8601(),

    validator.sanitizeBody("book").escape(),
    validator.sanitizeBody("status").trim().escape(),
    validator.sanitizeBody("imprint").escape(),
    validator.sanitizeBody("due_back").toDate(),

    (req,res,next)=>{
        if(req.user_logged==0){
            const errors=validator.validationResult(req);
            
            var Bookinstance=new bookinstance({
                book:req.body.book,
                imprint:req.body.imprint,
                status:req.body.status,
                due_back:req.body.due_back
            });

            if(!errors.isEmpty()){
                book.find().exec((err,results)=>{
                    if(err){return next(err);}
                    res.render("bookinstance_form",{title:"Book Instance Form",books:results,bookinstance:Bookinstance,errors:errors.array(),user:req.user_detail,user_logged:req.user_logged});
                });
            }
            else{
                Bookinstance.save((err)=>{
                    if(err){return next(err);}
                    res.redirect(Bookinstance.url);
                })
            }
        }
        else{
            res.redirect("/users/")
        }
    }
]

exports.bookinstance_delete_get=function(req,res,next){
    if(req.user_logged==0){
        bookinstance.findById(req.params.id).populate("book").exec((err,instance)=>{
            if(err){return next(err);}
            res.render("bookinstance_delete",{title:"Book Instance Delete Page",bookinstance_detail:instance,user:req.user_detail,user_logged:req.user_logged});
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_delete_post=function(req,res,next){
    if(req.user_logged==0){
        bookinstance.findById(req.body.biid).populate("book").exec((err,instance)=>{
            if(err){return next(err);}
            if(bookinstance==null){
                res.render("bookinstance_delete",{title:"Book Instance Delete Page",bookinstance_detail:instance,user:req.user_detail,user_logged:req.user_logged});
            }
            bookinstance.findByIdAndRemove(req.body.biid).exec((err)=>{
                if(err){return next(err);}
                res.redirect("/catalog/bookinstances");
            })
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_update_get=function(req,res,next){
    if(req.user_logged!=2){
        bookinstance.findById(req.params.id).populate("book").exec((err,results)=>{
            if(err){return next(err);}
            res.render("bookinstance_form.pug",{title:"Book Instance Update Form",book:results.book,bookinstance:results,update:1,user:req.user_detail,user_logged:req.user_logged});
        })
    }
    else{
        res.redirect("/users/")
    }
};

exports.bookinstance_update_post=[
    validator.body("book","book cannot be empty").isLength({min:1}).trim(),
    validator.body("imprint","imprint cannot be empty").isLength({min:1}).trim(),
    validator.body("due_back","invalid date").optional({checkFalsy:true}).isISO8601(),

    validator.sanitizeBody("book").escape(),
    validator.sanitizeBody("status").trim().escape(),
    validator.sanitizeBody("imprint").escape(),
    validator.sanitizeBody("due_back").toDate(),

    function(req,res,nex){
        if(req.user_logged!=2){
            const errors=validator.validationResult(req);

            var Bookinstance=new bookinstance({
                book:req.body.book,
                imprint:req.body.imprint,
                status:req.body.status,
                due_back:req.body.due_back,
                _id:req.params.id,
                borrowed_by:req.user_detail._id
            });

            if(!errors.isEmpty()){
                res.render("bookinstance_form",{title:"Book Instance Update form",bookinstance:Bookinstance,book:Bookinstance.book,errors:errors.array(),update:2,user:req.user_detail,user_logged:req.user_logged});
            }
            else{
                bookinstance.findByIdAndUpdate(req.params.id,Bookinstance,{}).exec((err,binstance)=>{
                    if(err){return next(err);}
                    if(req.user_logged==1){
                        req.user_detail.books_borrowed.push(Bookinstance._id);
                        var user=new User({
                            books_borrowed:req.user_detail.books_borrowed,
                            name:req.user_detail.name,
                            email:req.user_detail.email,
                            mobile:req.user_detail.mobile,
                            password:req.user_detail.password,
                            admin:req.user_detail.admin,
                            _id:req.user_detail._id
                        });

                        User.findByIdAndUpdate(user._id,user,(err,user_detail)=>{
                            if(err){console.log(err)}
                        });
                        var transporter=nodemailer.createTransport({
                            service:"gmail",
                            auth:{
                                user:"web.developer.sanjay.majhi",
                                pass:"Qwerty12345*"
                            }
                        })
                
                        var mailoption={
                            from:"web.developer.sanjay.majhi",
                            to:req.user_detail.email,
                            subject:"book borrowed",
                            text:"New Book Borrowed \n book instance id : "+Bookinstance._id+"\n return by: "+Bookinstance.due_back
                        }
                
                        transporter.sendMail(mailoption,(err,info)=>{
                            if(err){console.log(err)}
                            else{console.log("Main sent : "+info.response)}
                        })
                        res.redirect("/users/"+req.user_detail._id+"/borrowed");
                    }
                    else{
                        res.redirect(binstance.url);
                    }
                })
            }
        }
        else{
            res.redirect("/users/")
        }
    }
];

