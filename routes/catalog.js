var express=require("express");
var router=express.Router();

var bookController=require("../controllers/bookController");
var genreController=require("../controllers/genreController");
var bookinstanceController=require("../controllers/bookInstanceController");
var authorController=require("../controllers/authorController");

var auth=require("../auth");

//book
router.get("/",auth,bookController.index);

router.get("/book/create",auth,bookController.book_create_get);
router.post("/book/create",auth,bookController.book_create_post);

router.get("/books",auth,bookController.book_list);
router.post("/books",auth,bookController.book_list);

router.get("/book/:id",auth,bookController.book_detail);
router.post("/book/:id",auth,bookController.book_detail);

router.get("/book/:id/update",auth,bookController.book_update_get);
router.post("/book/:id/update",auth,bookController.book_update_post);

router.get("/book/:id/delete",auth,bookController.book_delete_get);
router.post("/book/:id/delete",auth,bookController.book_delete_post);

//bookinstance
router.get("/bookinstances",auth,bookinstanceController.bookinstance_list);
router.post("/bookinstances",auth,bookinstanceController.bookinstance_list);

router.get("/bookinstance/create",auth,bookinstanceController.bookinstance_create_get);
router.post("/bookinstance/create",auth,bookinstanceController.bookinstance_create_post);

router.get("/bookinstance/:id/update",auth,bookinstanceController.bookinstance_update_get);
router.post("/bookinstance/:id/update",auth,bookinstanceController.bookinstance_update_post);

router.get("/bookinstance/:id/delete",auth,bookinstanceController.bookinstance_delete_get);
router.post("/bookinstance/:id/delete",auth,bookinstanceController.bookinstance_delete_post);

router.get("/bookinstance/:id",auth,bookinstanceController.bookinstance_detail);
router.post("/bookinstance/:id",auth,bookinstanceController.bookinstance_detail);

router.get("/bookinstance/:id/borrow",auth,bookinstanceController.bookinstance_update_get);
router.post("/bookinstance/:id/borrow",auth,bookinstanceController.bookinstance_update_post);

//genre
router.get("/genre/create",auth,genreController.genre_create_get);
router.post("/genre/create",auth,genreController.genre_create_post);

router.get("/genres",auth,genreController.genre_list);
router.post("/genres",auth,genreController.genre_list);

router.get("/genre/:id",auth,genreController.genre_detail);
router.post("/genre/:id",auth,genreController.genre_detail);

router.get("/genre/:id/update",auth,genreController.genre_update_get);
router.post("/genre/:id/update",auth,genreController.genre_update_post);

router.get("/genre/:id/delete",auth,genreController.genre_delete_get);
router.post("/genre/:id/delete",auth,genreController.genre_delete_post);

//author
router.get("/author/create",auth,authorController.author_create_get);
router.post("/author/create",auth,authorController.author_create_post);

router.get("/authors",auth,authorController.author_list);
router.post("/authors",auth,authorController.author_list);

router.get("/author/:id",auth,authorController.author_detail);
router.post("/author/:id",auth,authorController.author_detail);

router.get("/author/:id/update",auth,authorController.author_update_get);
router.post("/author/:id/update",auth,authorController.author_update_post);

router.get("/author/:id/delete",auth,authorController.author_delete_get);
router.post("/author/:id/delete",auth,authorController.author_delete_post);

module.exports=router;