const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const reviewController = require("../controller/reviewController")
const auth = require("../middleware/auth")

//------------ user registration -----------------

router.post("/register" , userController.createUser)

//------------ user login -----------------

router.post("/login" , userController.loginUser)

//------------ book creation -----------------

router.post("/books" ,auth.Authentication , auth.Authorisation , bookController.createBook)

//------------ get books by query filters -----------------

router.get("/books" ,auth.Authentication, bookController.getBooks)

//------------ get books by book ID -----------------

router.get("/books/:bookId" ,auth.Authentication, bookController.getBooksById)

//------------ update books -----------------

router.put("/books/:bookId" , auth.Authentication ,auth.Authorisation , bookController.updateBooks)

//------------ delete books -----------------

router.delete("/books/:bookId",auth.Authentication , auth.Authorisation,bookController.deleteBookById)

//------------ adding reviews -----------------

router.post("/books/:bookId/review",reviewController.createReviews)

//------------ updating reviews -----------------

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)

//------------deleting reviews-----------------

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteByReview)

//------------ edge case for wrong route-----------------

router.all("/*",(req,res)=>{res.status(400).send({status:false,message:"Endpoint is not correct"})})


module.exports = router