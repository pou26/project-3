//-----------------------------------------importing--------------------------------------------------------

const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const validator = require("../validators/validator")
let userModel = require("../model/userModel")

let { isValidObjectId, isValidName, isValid, isNumber, validISBN } = validator

//-------------------- books creation-------------------

const createBook = async function (req, res) {
    try {
        let data = req.body

        //--------------- user authorization starts-------------------

        let decodedToken = req["x-api-key"]
        if (!validator.isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "Please provide data for book creation" }) }
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data

        if (!userId) return res.status(400).send({ status: false, message: `UserId is mandatory` })

        if (!validator.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: `This UserId: ${userId} is not Valid.` }) }

        const checkUserId = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!checkUserId) { return res.status(400).send({ status: false, message: `This UserId: ${data} does not Exist.` }) }

        if (checkUserId['_id'].toString() !== decodedToken.UserId) {
            return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        }

        //-------------- user authorization ends -----------------

        //---------------validation starts-----------------------
        //----------------title validation ----------------------

        if (!title) { return res.status(400).send({ status: false, msg: "Please provide title" }) }
        if (!validator.isNotEmpty(title)) { return res.status(400).send({ status: false, msg: "Please provide a valid title" }) }
        data.title = title.trim();
        let findTitle = await bookModel.findOne({ title: data.title })
        if (findTitle) { return res.status(400).send({ status: false, msg: "title should be unique" }) }
        //----------------excerpt validation ----------------------

        if (!excerpt) { return res.status(400).send({ status: false, msg: "Please provide excerpt" }) }
        if (!isValid(excerpt)) { return res.status(400).send({ status: false, msg: "Please provide a valid excerpt" }) }
        data.excerpt = excerpt.trim()

        //----------------ISBN validation ----------------------

        if (!ISBN) { return res.status(400).send({ status: false, msg: "Please provide ISBN" }) }
        if (!validISBN(ISBN)) { return res.status(400).send({ status: false, msg: "Please provide a valid ISBN" }) }
        let findISBN = await bookModel.findOne({ ISBN: ISBN })
        if (findISBN) { return res.status(400).send({ status: false, msg: "This ISBN already exist" }) }
        //----------------category and subcategory validation ----------------------
        if (!category) { return res.status(400).send({ status: false, msg: "Please provide Book's category" }) }
        if (!isValid(category)) { return res.status(400).send({ status: false, msg: "Please provide a valid category" }) }
        data.category = category.trim()

        if (!subcategory) { return res.status(400).send({ status: false, msg: "Please provide Book's subcategory" }) }
        if (!isValid(subcategory)) { return res.status(400).send({ status: false, msg: "Please provide a valid subcategory" }) }
        data.subcategory = subcategory.trim()

        if (Object.keys(data).some(t => t == "reviews")) {
            if (!isNumber(reviews)) { return res.status(400).send({ status: false, msg: "Please provide reviews in number format" }) }
        }

        //----------------release date validation ----------------------
        if (!releasedAt) { return res.status(400).send({ status: false, msg: "Please provide Book's release date" }) }
        if (!/^(18|19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "Released date is not valid it should be YYYY-MM-DD" })
        }
        //---------------validation ends----------------------

        //----------------creating book ----------------------

        let newBook = await bookModel.create(data)
        let filterBook = await bookModel.findOne(newBook).select({ __v: 0 })
        res.status(201).send({ status: true, msg: "Success", data: filterBook }) 

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

//-----------------------------------------getBooks--------------------------------------------------------

const getBooks = async function (req, res) {
    try {
        let data = req.query

        if (Object.keys(data).some(a => a == "userId")) {

            if (!data.userId) return res.status(400).send({ message: "provide userId" })
            if (!validator.isValidObjectId(data.userId)) return res.status(400).send({ msg: "authorId is not valid" });
        }
        if (Object.keys(data).some(a => a == "category")) {

            if (!data.category) return res.status(400).send({ message: "provide category" })
            if (!isValid(data.category)) { return res.status(400).send({ status: false, msg: "Please provide a valid category" }) }
            data.category = data.category.trim()

        }
        if (Object.keys(data).some(a => a == "subcategory")) {

            if (!data.subcategory) return res.status(400).send({ message: "provide subcategory" })
            if (!isValid(data.subcategory)) { return res.status(400).send({ status: false, msg: "Please provide a valid subcategory" }) }
            data.subcategory = data.subcategory.trim()

        }

        if (!Object.keys(data).length) {
            let filter = await bookModel.find({ $and: [data, { isDeleted: false }] }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({ title: 1 })
            return res.status(200).send({ status: true, message: "Books list", data: filter })
        }

        let filter = await bookModel.find({ $and: [data, { isDeleted: false }] }).select({ "deletedAt": 0, "ISBN": 0, "__v": 0, "createdAt": 0, "updatedAt": 0,"subcategory" :0 }).sort({ title: 1 })
        if (!filter.length){
            return res.status(404).send({ status: false, msg: "No such documents found" })
        }
        res.status(200).send({ status: true, message: "Books list", data: filter })

    }
    catch (error) { res.status(500).send({ status: false, message: error.message }) }

}
//-----------------------------------------getBooksById--------------------------------------------------------
const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid bookId" })
        }
        let books = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0, deletedAt: 0 })

        if (!books) {
            return res.status(404).send({ status: false, message: `Book with bookId:${bookId} is not present...` })
        }
  
        let { _id, title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, createdAt, updatedAt } = books

        let findReviews = await reviewModel.find({ bookId: bookId }).select({ isDeleted: 0, __v: 0 });

        let filter = { _id, title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, createdAt, updatedAt, reviewData: findReviews };

        res.status(200).send({ status: true, message: "Book list", data: filter })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

//-----------------------------------------update books--------------------------------------------------------

const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let book = await bookModel.findById(bookId);
        if (!book || book.isDeleted === true) {
            return res.status(404).send({ status: false, message: "Book not found.." });
        }
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide details for updation" });
        }
        let { title, excerpt, ISBN, releasedAt } = requestBody;
        let dupTitle = await bookModel.findOne({ title: title.trim() })
        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Please provide a valid title for updation" });
            }
            if (dupTitle) {
                return res.status(409).send({ status: false, message: "Book with this title already exists.." });
            }
            else {
                book.title = title.trim();
            }
        }
        if (excerpt) {
            if (isValid(excerpt)) {
                book.excerpt = excerpt.trim();
            }
            else {
                return res.status(400).send({ status: false, message: "Please provide a valid excerpt for updation" });
            }
        }
        let dupISBN = await bookModel.findOne({ ISBN: ISBN })
        if (ISBN) {
            if (!validator.validISBN(ISBN)) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid ISBN for updation.."
                });
            }
            if (dupISBN) {
                return res.status(409).send({ status: false, message: "Book with this ISBN already exists.." });
            }
            else {
                book.ISBN = ISBN
            }
        }
        if (releasedAt) {
            if (!validator.isValidDate(releasedAt)) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid release date for updation.."
                });
            }
            else {
                book.releasedAt = releasedAt
            }
        }

        let updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, book, { new: true }).select({ "__v": 0, "deletedAt": 0 })
        return res.status(200).send({ status: true, message: "Successfully updated", data: updatedBook })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//------------------------------------delete books by Id----------------------------------------------
const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        let deleteByBookId = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!deleteByBookId) { return res.status(404).send({ status: false, message: "Book is already deleted" }) }

        res.status(200).send({ status: true, message: 'Book Deleted Successfully' })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}

//------------------------------export modules--------------------------------------------------------------------

module.exports = { getBooksById, getBooks, createBook, updateBooks, deleteBookById }