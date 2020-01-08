var Genre=require("../models/genre");
var book=require("../models/book");
var async=require("async");
var validator=require("express-validator");

var logged_user=require("../logged_user");

exports.genre_list=function(req,res){
    Genre.find().sort([["name","ascending"]]).exec((err,list)=>{
        res.render("genre_list",{title:"Genre list",errors:err,genres:list,user:logged_user.user_detail,user_logged:logged_user.user_logged});
    });
};

exports.genre_detail=function(req,res,next){
    async.parallel({
        genre:(callback)=>{
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books:(callback)=>{
            book.find({"genre":req.params.id}).populate("author").exec(callback);
        }
    },
    (err,results)=>{
      if(err){
          return next(err);
      }
      if(results.genre==null){
          var err=new Error("Genre Not Found");
          err.status=404;
          return next(err);
      }
      res.render("genre_detail",{title:"Genre Detail",genre:results.genre,books:results.genre_books,user:logged_user.user_detail,user_logged:logged_user.user_logged});
    });
};

exports.genre_create_get=function(req,res){
    res.render("genre_form",{title:"Create Genre"});
};

exports.genre_create_post=[
    validator.body("name","Genre name not entered").isLength({min:1}).trim(),
    validator.sanitizeBody("name").escape(),

    function(req,res,next){
        var errors=validator.validationResult(req);
        var genre=new Genre({
            name:req.body.name
        });
        if(!errors.isEmpty){
            res.render("genre_form",{title:"Create Genre",errors:errors.array(),genre:genre});
        }
        else{
            Genre.findOne({"name":req.body.name}).exec((err,result)=>{
                if(err){return next(err);}
                if(result){
                    res.redirect(result.url);
                }
                else{
                    genre.save((err)=>{
                        if (err){return next(err);}
                    });
                    res.redirect(genre.url);
                    
                }
            });

      }
    }
];



exports.genre_delete_get=function(req,res,next){
    async.parallel({
        genre:(callback)=>{
            Genre.findById(req.params.id).exec(callback);
        },
        books:(callback)=>{
            book.find({genre:req.params.id}).populate("author").exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err);}
        if(results.genre==null){
            res.redirect("/catalog/genres");
        }
        res.render("genre_delete",{title:"Genre Delete Page",genre:results.genre,books:results.books});
    })
};

exports.genre_delete_post=function(req,res,next){
    async.parallel({
        genre:(callback)=>{
            Genre.findById(req.body.gid).exec(callback);
        },
        books:(callback)=>{
            book.find({genre:req.body.gid}).populate("author").exec(callback);
        }
    },
    (err,results)=>{
        if(err){return next(err);}
        if(results.books.length>0){
            res.render("genre_delete",{title:"Genre Delete Page",genre:results.genre,books:results.books});
        }
        else{
            Genre.findByIdAndRemove(req.body.gid).exec((err)=>{
                if(err){return next(err);}
                res.redirect("/catalog/genres");
            })
        }
        
    })
};


exports.genre_update_get=function(req,res,next){
    Genre.findById(req.params.id).exec((err,results)=>{
        if(err){return next(err);}
        res.render("genre_form",{title:"Genre Update Form",genre:results})
    })
};

exports.genre_update_post=[
    validator.body("name","Genre name cannot be empty.").isLength({min:1}).trim(),

    validator.sanitizeBody("name").escape(),

    (req,res,next)=>{

        const errors=validator.validationResult(req);

        var genre=new Genre({
            name:req.body.name,
            _id:req.params.id
        });
        if(!errors.isEmpty()){
            res.render("genre_form",{title:"Genre Update Form",genre:genre,errors:errors.array()});
        }
        else{
            Genre.findByIdAndUpdate(req.params.id,genre).exec((err,genre_detail)=>{
                if(err){return next(err);}
                res.redirect(genre_detail.url);
            })
        }

    }
]