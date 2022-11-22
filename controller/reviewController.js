//---------------------------------------importing modules--------------------------------------------

const mongoose = require("mongoose")
const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const validator = require("../validators/validator")

//-------------------------create review------------------------------------------------
const createReviews = async function (req, res) {
    try {

        const { bookId } = req.params;

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid bookId" })
        }

        let books = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0, deletedAt: 0 })
        if (!books) {
            return res.status(404).send({ status: false, message: `Book with bookId:${bookId} is not present...` })
        }
        if (!validator.isValidRequestBody(books)) {
            return res.status(404).send({ status: false, message: `Book is not present` })
        }

        req.body["bookId"] = bookId;

        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Provide details for reviews creation.." })
        }
        const { review, rating } = requestBody;

        if (!requestBody.reviewedBy) {
            requestBody.reviewedBy = "Guest";
        }
        if (!requestBody.reviewedAt) {
            requestBody.reviewedAt = Date.now();
        }
        if (!review) {
            return res.status(400).send({ status: false, message: "Provide review details .." })
        }

        if (!validator.isValid(review)) {
            return res.status(400).send({ status: false, message: "Provide valid review details .." })
        }
        requestBody.review = review.trim()
        if (!rating && rating != 0) return res.status(400).send({ status: false, message: "Rating is missing" })//0 =null

        if (typeof rating !== 'number' || rating < 1 || rating > 5 )
            return res.status(400).send({ status: false, message: 'Rating should be an Integer & between 1 to 5' })

        let createReview = await reviewModel.create(requestBody)

        let reviewId = createReview._id.toString()

        let findReviews = await reviewModel.find({ _id: reviewId, isDeleted: false }).select({ isDeleted: 0, __v: 0 }) //find the recently created review

        newBookId = bookId.toString()

        let reviewsCount = await reviewModel.find({ bookId: newBookId }).count()

        let updateBook = await bookModel.findByIdAndUpdate({ _id: newBookId }, { reviews: reviewsCount }, { new: true })

        const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt } = updateBook

        let filter = { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, reviewsData: findReviews }

        res.status(201).send({ status: true, message: "review successfully created ", data: filter })


    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}


let { isValidObjectId, isValidReviewer } = validator

//--------------------------------update review-------------------------------------------------------------------

const updateReview = async function (req, res) {
    try {
        let data = req.body
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        const { review, rating, reviewedBy } = data

        /************** Validation for bookId and reviewId **************/
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid book id." })

        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Invalid review id." })

        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "You must give data for updation of review." })  //Object.keys return array of keys

        // check review
        if (!review) return res.status(400).send({ status: false, message: "Review is missing" })
        if (!validator.isValid(review)) {
            return res.status(400).send({ status: false, message: "Provide valid review details .." })
        }
        data.review = review.trim()

        // check rating
        if (!rating) return res.status(400).send({ status: false, message: "Rating is missing" })

        if (typeof data.rating != 'number' || data.rating < 1 || data.rating > 5) // check this one in string and number also
            return res.status(400).send({ status: false, message: 'Rating should be an Integer & between 1 to 5' })

        // check reviewedBy
        if (!reviewedBy) return res.status(400).send({ status: false, message: "Reviewer's name is missing" })
        
        if (!isValidReviewer) return res.status(400).send({ status: false, message: "enter a valid reviewer's name" })
        data.reviewedBy = reviewedBy.trim()
        const searchBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ ISBN: 0, __v: 0, deletedAt: 0 })

        if (!searchBook) return res.status(404).send({ status: false, message: " Book deleted or not exist with this id" })

        const updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { review: data.review, rating: rating, reviewedBy: data.reviewedBy }, { new: true }).select({ __v: 0, isDeleted: 0 })

        let { ...data3 } = searchBook;    //it storing or spreading the data of searchbook into data3
        console.log(data3);
        data3._doc.reviewsData = updateReview //under data3 ._doc is a key and reviewsData is another key of that,updateReview's data is storing into that

        if (!updateReview) return res.status(404).send({ status: false, message: "Review deleted or not exist with this id" })

        return res.status(200).send({ status: true, message: "Books list", data: data3._doc })//we're printing only data3.doc cause reviewsData is already stored into that

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

//----------------------------------------deleteByReview---------------------------------------------------------------

const deleteByReview = async function (req, res) {

    try {
        data = req.params
        if (!data) {
            return res.status(400).send({ status: false, message: "Please provide parameters to delete review.." })
        }
        let { bookId, reviewId } = data;
        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid bookId" })
        }
        if (!validator.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid reviewId" })
        }

        const findBook = await bookModel.findOne({ _id: bookId })

        if (!findBook) return res.status(404).send({ status: false, msg: "Book not found" })

        if (findBook.isDeleted == true) return res.status(404).send({ status: false, msg: "this book is already deleted" })

        const findReview = await reviewModel.findOne({ _id: reviewId })

        if (!findReview) return res.status(404).send({ status: false, msg: "review not found" })

        if (findReview.isDeleted == true) return res.status(404).send({ status: false, msg: "this review is already deleted" })

        bookIdFromReview = findReview.bookId.toString()

        if (bookIdFromReview !== bookId) return res.status(400).send({ status: false, msg: "Cannot add a review , book is not present" })

        const deletereview = await reviewModel.findByIdAndUpdate(reviewId, { $set: { isDeleted: true } }, { new: true });
        const reviewCount = await reviewModel.find({ bookId: bookId , isDeleted :false}).count()
        const updateBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { reviews: reviewCount }, { new: true })

        return res.status(200).send({ status: true, msg: " review deleted successfully" })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

//-------------------------exporting modules------------------------------------------------

module.exports = { createReviews, updateReview, deleteByReview }

