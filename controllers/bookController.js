var book=require("../models/book");
var bookinstance=require("../models/bookinstance");
var genre=require("../models/genre");
var author=require("../models/author");

var async=require("async");

var validator=require("express-validator");

exports.index=function(req,res){
    async.parallel({
        bookCount:function(callback){
            book.countDocuments({},callback);
        },
        bookInstanceCount:function(callback){
            bookinstance.countDocuments({},callback);
        },
        bookInsAvailCount:function(callback){
            bookinstance.countDocuments({status:"Available"},callback);
        },
        genreCount:function(callback){
            genre.countDocuments({},callback);
        },
        authorCount:function(callback){
            author.countDocuments({},callback);
        }
    },
    function(err,results){
        res.render("index",{title:"Library Home Page",errors:err,data:results});
    });
};

exports.book_list=function(req,res){
    book.find({},"title author").populate("author")
    .exec(function(err,list){
        res.render("book_list",{title:"Book List",errors:err,books:list});
    })
};

exports.book_detail=function(req,res,next){
    async.parallel({
        book:(callback)=>{
            book.findById(req.params.id).populate("author").populate("genre")
            .exec(callback);
        },
        book_instance:(callback)=>{
            bookinstance.find({"book":req.params.id}).exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err)}
        if(results.book==null){
            var err=new Error("Book Not Found");
            err.status=404;
            return next(err);
        }
        res.render("book_detail",{book:results.book,bookins:results.book_instance});
    });
};

exports.book_create_get=function(req,res,next){
    async.parallel({
        authors:(callback)=>{author.find().exec(callback)},
        genres:(callback)=>{genre.find().exec(callback)}
    },
    (errors,results)=>{
        if(errors){return next(errors);}
        res.render("book_form",{title:"Book Form",authors:results.authors,genres:results.genres});    
    });
};

exports.book_create_post=[
    (req,res,next)=>{
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==="undefined"){
                req.body.genre=[];
            }
            else{
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    validator.body("title","title cannot be empty").isLength({min:1}).trim(),
    validator.body("author","author cannot be empty").isLength({min:1}).trim(),
    validator.body("summary","summary cannot be empty").isLength({min:1}).trim(),
    validator.body("isbn","isbn cannot be empty").isLength({min:1}).trim(),

    validator.sanitizeBody('title').escape(),
    validator.sanitizeBody('author').escape(),
    validator.sanitizeBody('summary').escape(),
    validator.sanitizeBody('isbn').escape(),
    validator.sanitizeBody('genre.*').escape(),

    (req,res,next)=>{
        const errors=validator.validationResult(req);

        var Book= new book({
            title:req.body.title,
            author:req.body.author,
            genre:req.body.genre,
            summary:req.body.summary,
            isbn:req.body.isbn
        });

        if(!errors.isEmpty()){
            async.parallel({
                authors:(callback)=>{
                    author.find().exec(callback);
                },
                genres:(callback)=>{
                    genre.find().exec(callback);
                }
            },
            (err,results)=>{
                if(err){return next(err);}
                for(let i=0;i<results.genres.length;i++){
                    if(Book.genre.indexOf(results.genres[i]._id)>-1){
                        results.genres[i].checked="true";
                    }
                }
                res.render("book_form",{title:"Book Form",authors:results.authors,genres:results.genres,book:Book,errors:errors.array()});
            });
        }
        else{
            Book.save((err)=>{
                if(err){return next(err);}
                res.redirect(Book.url);
            });
            
        }
    }];

exports.book_update_get=function(req,res,next){
    async.parallel({
        book:(callback)=>{
            book.findById(req.params.id).populate("author").populate("genre").exec(callback);
        },
        authors:(callback)=>{
            author.find().exec(callback);
        },
        genres:(callback)=>{
            genre.find().exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err);}
        for(var i=0;i<results.genres.length;i++){
            for(var j=0;j<results.book.genre;j++){
                if(results.genres[i]._id==results.book.genre[j]._id.toString()){
                    results.genres[i]["checked"]="true";
                }
            }
        }
        res.render("book_form",{title:"Book Update Form",book:results.book,authors:results.authors,genres:results.genres});
    });
};

exports.book_update_post=[
    (req,res,next)=>{
        if (!(req.body.genre instanceof Array)){
            if(req.body.genre==="undefined"){
                req.body.genre=[];
            }
            else{
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    validator.body("title","title cannot be empty").isLength({min:1}).trim(),
    validator.body("author","author cannot be empty").isLength({min:1}).trim(),
    validator.body("isbn","isbn cannot be empty").isLength({min:1}).trim(),
    validator.body("summary","summary cannot be empty").isLength({min:1}).trim(),

    validator.sanitizeBody("title").escape(),
    validator.sanitizeBody("author").escape(),
    validator.sanitizeBody("isbn").escape(),
    validator.sanitizeBody("summary").escape(),
    validator.sanitizeBody("genre.*").escape(),

    (req,res,next)=>{
        const errors=validator.validationResult(req);

        var Book=new book({
            title:req.body.title,
            author:req.body.author,
            genre:req.body.genre,
            summary:req.body.summary,
            isbn:req.body.isbn,
            _id:req.params.id
        })

        if(!errors.isEmpty()){
            author.find().exec((err,authors)=>{
                res.render("book_form",{title:"Book Update Form",authors:authors,book:Book,errors:errors.array()})    
            })
        }
        else{
            book.findByIdAndUpdate(req.params.id,Book,{}).exec((err,book_detail)=>{
                if(err){return next(err);}
                res.redirect(book_detail.url);
            })
        }
    }
]

exports.book_delete_get=function(req,res,next){
    async.parallel({
        book:(callback)=>{
            book.findById(req.params.id).populate("author").populate("genre").exec(callback);
        },
        bookinstances:(callback)=>{
            bookinstance.find({book:req.params.id}).exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err);}
        if(results.book==null){
            res.redirect("/catalog/books")  //if someone changes link manually in address bar
        }
        res.render("book_delete",{title:"Book Delete Page",book:results.book,bookinstances:results.bookinstances});
    })
};

exports.book_delete_post=function(req,res,next){
    async.parallel({
        book:(callback)=>{
            book.findById(req.params.bid).exec(callback);
        },
        bookinstances:(callback)=>{
            bookinstance.find({book:req.params.bid}).exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err);}
        if(results.bookinstances.length>0){
            res.render("book_delete",{title:"Book Delete Page",book:results.book,bookinstances:results.bookinstances});
        }
        else{
            book.findByIdAndRemove(req.body.bid).exec((err)=>{
                if(err){return next(err);}
                res.redirect("/catalog/books");
            })
        }
        
    })
};