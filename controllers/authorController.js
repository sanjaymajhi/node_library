var author=require("../models/author");
var book=require("../models/book");
var async=require("async");
var validator=require("express-validator");

var logged_user=require("../logged_user");

exports.author_detail=function(req,res){
    if(logged_user.user_logged!=2){
        async.parallel({
            author_detail:(callback)=>{
                author.findById(req.params.id).sort([["name","ascending"]]).exec(callback);
            },
            books:(callback)=>{
                book.find({"author":req.params.id},"title summary").exec(callback);
            }
        },
        (err,results)=>{
            if(err){return next(err);}
            if(results.author_detail==null){
                var err=new Error("Author not found");
                err.status=404;
                return next(err);
            }
            res.render("author_detail",{author:results.author_detail,books:results.books,user:logged_user.user_detail,user_logged:logged_user.user_logged});
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.author_list=function(req,res){
    if(logged_user.user_logged!=2){
        author.find().sort([["family_name","Ascending"]])
        .exec((err,list)=>{
            res.render("author_list",{title:"Author List Page",errors:err,authors:list,user:logged_user.user_detail,user_logged:logged_user.user_logged});
        });
    }
    else{
        res.redirect("/users/")
    }
};

exports.author_create_get=function(req,res){
    if(logged_user.user_logged==0){
        res.render("author_form",{"title":"Author Form",user:logged_user.user_detail,user_logged:logged_user.user_logged});
    }
    else{
        res.redirect("/users/")
    }
};

exports.author_create_post=[
    
    validator.body("first_name").isLength({min:2}).trim().withMessage("First name cannot be so small").isAlpha().withMessage("First name can contain only alphabets"),
    validator.body("family_name").isLength({min:2}).trim().withMessage("family name cannot be so small").isAlpha().withMessage("Family name can contain only alphabets"),
    validator.body("date_of_birth").optional({checkFalsy:true}).isISO8601().withMessage("Invalid date"),
    validator.body("date_of_death").optional({checkFalsy:true}).isISO8601().withMessage("Invalid date"),
    
    validator.sanitizeBody("first_name").escape(),
    validator.sanitizeBody("family_name").escape(),
    validator.sanitizeBody("date_of_birth").escape(),
    validator.sanitizeBody("date_of_death").escape(),

    function(req,res,next){
        if(logged_user.user_logged==0){
            var errors=validator.validationResult(req);

            if(!errors.isEmpty()){
                res.render("author_form",{title:"Author Form",errors:errors.array(),author:req.body,err:1,user:logged_user.user_detail,user_logged:logged_user.user_logged});
            }
            else{
                author.findOne({first_name:req.body.first_name}).exec((err,result)=>{
                    if(err){return next(err);}
                    if(result){
                        res.redirect(result.url);
                    }
                    else{
                        var Author=new author({
                            first_name:req.body.first_name,
                            family_name:req.body.family_name,
                            date_of_birth:req.body.date_of_birth,
                            date_of_death:req.body.date_of_death
                        });
                        Author.save((err)=>{
                            if(err){return next(err);}
                            res.redirect(Author.url);
                        });
                        
                    }
                })

            }
        }
        else{
            res.redirect("/users/")
        }
    }
];

exports.author_delete_get=function(req,res,next){
    if(logged_user.user_logged==0){
        async.parallel({
            author:(callback)=>{
                author.findById(req.params.id).exec(callback);
            },
            books:(callback)=>{
                book.find({"author":req.params.id}).exec(callback);
            }
        },
        (err,results)=>{
            if(err){return next(err);}
            if(results.author==null){
                res.redirect("/catalog/authors");
            }
            //else not used as if null the redirected to given url and not go to next line
            res.render("author_delete",{title:"Author Delete Form",author:results.author,books:results.books,user:logged_user.user_detail,user_logged:logged_user.user_logged})
            
        })
    }
    else{
        res.redirect("/users/")
    }
};

exports.author_delete_post=function(req,res,next){
    if(logged_user.user_logged==0){
        async.parallel({
            author:(callback)=>{
                author.findById(req.body.aid).exec(callback);
            },
            books:(callback)=>{
                book.find({"author":req.body.aid}).exec(callback);
            }
        },
        (err,results)=>{
            if(err){return next(err);}
            if(results.books.length>0){
                res.render("author_delete",{title:"Author Delete Form",author:results.author,books:results.books,user:logged_user.user_detail,user_logged:logged_user.user_logged});
            }
            else{
                author.findByIdAndRemove(req.body.aid).exec((err)=>{
                    if(err){return next(err);}
                    res.redirect("/catalog/authors");
                })
            }
        })
    }
    else{
        res.redirect("/users/");
    }
};

exports.author_update_get=function(req,res,next){
    if(logged_user.user_logged==0){
        author.findById(req.params.id).exec((err,detail)=>{
            if(err){return next(err);}
            res.render("author_form",{title:"Author Update Form",author:detail,user:logged_user.user_detail,user_logged:logged_user.user_logged});
        });
    }
    else{
        res.redirect("/users/");
    }
};

exports.author_update_post=[
    validator.body("first_name","First Name cannot be empty").isLength({min:1}).trim().isAlpha().withMessage("First name cann contain only alphabets"),
    validator.body("family_name","First Name cannot be empty").isLength({min:1}).trim().isAlpha().withMessage("Family name cann contain only alphabets"),
    validator.body("date_of_birth","Invalid Date").optional({checkFalsy:true}).isISO8601(),
    validator.body("date_of_death","Invalid Date").optional({checkFalsy:true}).isISO8601(),

    validator.sanitizeBody("first_name").escape(),
    validator.sanitizeBody("family_name").escape(),
    validator.sanitizeBody("date_of_birth").toDate(),
    validator.sanitizeBody("date_of_death").toDate(),

    (req,res,next)=>{
        if(logged_user.user_logged==0){
            const errors=validator.validationResult(req);

            var Author=new author({
                first_name:req.body.first_name,
                family_name:req.body.family_name,
                date_of_birth:req.body.date_of_birth,
                date_of_death:req.body.date_of_death,
                _id:req.params.id
            });

            if(!errors.isEmpty()){
                res.render("author_form",{title:"Author Update Form",author:Author,errors:errors.array(),err:1,user:logged_user.user_detail,user_logged:logged_user.user_logged});
            }
            else{
                author.findByIdAndUpdate(req.params.id,Author,{}).exec((err,author_detail)=>{
                    if(err){return next(err);}
                    res.redirect(author_detail.url);
                })
            }
        }
        else{
            res.redirect("/users/")
        }
    }
]