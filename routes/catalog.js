var express=require("express");
var router=express.Router();

var bookController=require("../controllers/bookController");
var genreController=require("../controllers/genreController");
var bookinstanceController=require("../controllers/bookInstanceController");
var authorController=require("../controllers/authorController");

//book
router.get("/",bookController.index);

router.get("/book/create",bookController.book_create_get);
router.post("/book/create",bookController.book_create_post);

router.get("/books",bookController.book_list);
router.post("/books",bookController.book_list);

router.get("/book/:id",bookController.book_detail);
router.post("/book/:id",bookController.book_detail);

router.get("/book/:id/update",bookController.book_update_get);
router.post("/book/:id/update",bookController.book_update_post);

router.get("/book/:id/delete",bookController.book_delete_get);
router.post("/book/:id/delete",bookController.book_delete_post);

//bookinstance
router.get("/bookinstances",bookinstanceController.bookinstance_list);
router.post("/bookinstances",bookinstanceController.bookinstance_list);

router.get("/bookinstance/create",bookinstanceController.bookinstance_create_get);
router.post("/bookinstance/create",bookinstanceController.bookinstance_create_post);

router.get("/bookinstance/:id/update",bookinstanceController.bookinstance_update_get);
router.post("/bookinstance/:id/update",bookinstanceController.bookinstance_update_post);

router.get("/bookinstance/:id/delete",bookinstanceController.bookinstance_delete_get);
router.post("/bookinstance/:id/delete",bookinstanceController.bookinstance_delete_post);

router.get("/bookinstance/:id",bookinstanceController.bookinstance_detail);
router.post("/bookinstance/:id",bookinstanceController.bookinstance_detail);

//genre
router.get("/genre/create",genreController.genre_create_get);
router.post("/genre/create",genreController.genre_create_post);

router.get("/genres",genreController.genre_list);
router.post("/genres",genreController.genre_list);

router.get("/genre/:id",genreController.genre_detail);
router.post("/genre/:id",genreController.genre_detail);

router.get("/genre/:id/update",genreController.genre_update_get);
router.post("/genre/:id/update",genreController.genre_update_post);

router.get("/genre/:id/delete",genreController.genre_delete_get);
router.post("/genre/:id/delete",genreController.genre_delete_post);

//author
router.get("/author/create",authorController.author_create_get);
router.post("/author/create",authorController.author_create_post);

router.get("/authors",authorController.author_list);
router.post("/authors",authorController.author_list);

router.get("/author/:id",authorController.author_detail);
router.post("/author/:id",authorController.author_detail);

router.get("/author/:id/update",authorController.author_update_get);
router.post("/author/:id/update",authorController.author_update_post);

router.get("/author/:id/delete",authorController.author_delete_get);
router.post("/author/:id/delete",authorController.author_delete_post);

module.exports=router;