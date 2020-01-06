var bookinstance=require("../models/bookinstance");
var book=require("../models/book");
var validator=require("express-validator");
var async=require("async");

exports.bookinstance_list=function(req,res){
    bookinstance.find({},"book imprint status due_back").populate('book')
    .exec((err,list)=>{
        if(err){return next(err);}
        res.render("bookinstance_list",{title:"Book Instance List",errors:err,bookinstances:list});
    })
};

exports.bookinstance_detail=function(req,res){
    bookinstance.findById(req.params.id).populate("book").exec((err,result)=>{
        res.render("book_instance_detail",{detail:result});
    });
};

exports.bookinstance_create_get=function(req,res,next){
    book.find().exec((err,results)=>{
        if(err){return next(err);}
        res.render("bookinstance_form",{title:"Book Instance Form",books:results});
    });
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
                res.render("bookinstance_form",{title:"Book Instance Form",books:results,bookinstance:Bookinstance,errors:errors.array()});
            });
        }
        else{
            Bookinstance.save((err)=>{
                if(err){return next(err);}
                res.redirect(Bookinstance.url);
            })
        }
    }
]

exports.bookinstance_delete_get=function(req,res,next){
    bookinstance.findById(req.params.id).populate("book").exec((err,instance)=>{
        if(err){return next(err);}
        res.render("bookinstance_delete",{title:"Book Instance Delete Page",bookinstance_detail:instance});
    });
};

exports.bookinstance_delete_post=function(req,res,next){
    bookinstance.findById(req.body.biid).populate("book").exec((err,instance)=>{
        if(err){return next(err);}
        if(bookinstance==null){
            res.render("bookinstance_delete",{title:"Book Instance Delete Page",bookinstance_detail:instance});
        }
        bookinstance.findByIdAndRemove(req.body.biid).exec((err)=>{
            if(err){return next(err);}
            res.redirect("/catalog/bookinstances");
        })
    });
};

exports.bookinstance_update_get=function(req,res,next){
    
    bookinstance.findById(req.params.id).populate("book").exec((err,results)=>{
        if(err){return next(err);}
        res.render("bookinstance_form.pug",{title:"Book Instance Update Form",book:results.book,bookinstance:results,update:1});
    })
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
        const errors=validator.validationResult(req);

        var Bookinstance=new bookinstance({
            book:req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            due_back:req.body.due_back,
            _id:req.params.id
        });

        if(!errors.isEmpty()){
            res.render("bookinstance_form",{title:"Book Instance Update form",bookinstance:Bookinstance,book:Bookinstance.book,errors:errors.array(),update:2});
        }
        else{
            bookinstance.findByIdAndUpdate(req.params.id,Bookinstance,{}).exec((err,binstance)=>{
                if(err){return next(err);}
                res.redirect(binstance.url);
            })
        }
    }
]