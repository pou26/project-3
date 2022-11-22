const userModel = require("../model/userModel");
const validator = require("../validators/validator")
const jwt = require("jsonwebtoken")

//----------------create user------------------------

const createUser = async function (req, res) {

  try {
    let data = req.body;

    //------------- validating request body--------------------

    if (!validator.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "PLease provide a valid request body" })
    }

    //------------- destructring-------------------------------

    let { title, name, phone, email, password, address } = data;

    //---------------validation starts -------------------------

    //------------- title validation----------------------------

    if (!title) return res.status(400).send({ status: false, msg: "title is requried" })
    if (!validator.isValidTitle(title.trim())) return res.status(400).send({ status: false, msg: "Must use only Mr,Mrs and Miss.." })
    data.title = title.trim()

    //-------------- name validation---------------------

    if (!name) return res.status(400).send({ status: false, msg: "name is requried" })
    if (!validator.isNotEmpty(name)) return res.status(400).send({ status: false, msg: "name is required" })
    data.name = name.trim()
    if (!validator.isWrong(data.name)) return res.status(400).send({ status: false, msg: "name is not valid" })

    //-------------- phone no. validation---------------------

    if (!phone) return res.status(400).send({ status: false, msg: "phone no. is requried" })
    //if(!validator.isNumber)
    if (!validator.isValid(phone)) return res.status(400).send({ status: false, msg: "phone no must be of type string and should not be empty" })
    data.phone = phone.trim()
    if (!validator.isValidMobile(data.phone)) {
      return res.status(400).send({ status: false, message: "PLease provide a valid phone number of length 10" })
    }

    //----------------email validation-----------------------
    if(!email) return res.status(400).send({ status: false, msg: "email is required" })
    if (!validator.isNotEmpty(email)) return res.status(400).send({ status: false, msg: "email should not be empty" })
    data.email = email.trim()
    if (!validator.isValidEmail(data.email)) {
      return res.status(400).send({ status: false, message: "Please provide a valid email ID" })
    }

    //----------------password validation-----------------------

    if (!password) return res.status(400).send({ status: false, msg: "password is required" })
    if (!validator.isNotEmpty(password)) return res.status(400).send({ status: false, msg: "password is required" })
    data.password = password.trim()
    if (!validator.isValidPassword(data.password)) {
      return res.status(400).send({ status: false, message: "Password must contain an uppercase,a lowercase , a special character and should be of length between 8-15" })
    }

    //---------------address validation-------------------------

    if (Object.keys(data).some(a => a == "address")) {
      if(typeof address !== "object") return res.status(400).send({status: false, message: "Address should be in object format"})
      if (!validator.isValidRequestBody(address)) {
        return res.status(400).send({ status: false, message: "Please provide valid body for address " })
      }
      
      if(!address.street) return res.status(400).send({ status: false, message: "Please provide street " })
      if (!validator.isValidStreet(address.street)) return res.status(400).send({ status: false, message: "please provide valid street address." })
      data.address.street = address.street.trim()

      if(!address.city) return res.status(400).send({ status: false, message: "Please provide city " })
      if (!validator.isValidCity(address.city)) return res.status(400).send({ status: false, message: "please provide valid city name" })
      data.address.city = address.city.trim()

      if(!address.pincode) return res.status(400).send({ status: false, message: "Please provide pincode " })
      if (!validator.isValidPincode(address.pincode)) {
        return res.status(400).send({ status: false, message: "Pincode should be of length 6 only." })
      }
      
    }

    //---------------- check for duplicacy---------------------

    //----------------duplicacy for phone no.------------------

    const findPhone = await userModel.findOne({ phone: phone });
    if (findPhone) {
      return res.status(409).send({ status: false, message: "User with this phone number already exists" })
    }

    //----------------duplicacy for email ------------------

    const findEmail = await userModel.findOne({ email: data.email });
    if (findEmail) {
      return res.status(409).send({ status: false, message: "User with this email Id alredy exists." })
    }

    //----------------creation starts ----------------------

    const created = await userModel.create(data)

    //-----------------filtering data for response-----------

    let filter = {}

    filter["_id"] = created._id;
    filter["title"] = created.title;
    filter["name"] = created.name;
    filter["phone"] = created.phone;
    filter["email"] = created.email;
    filter["password"] = created.password;
    filter["address"] = created.address;
    filter["createdAt"] = created.createdAt;
    filter["updatedAt"] = created.updatedAt;

    //-----------------response---------------------

    res.status(201).send({ status: true, message: "User successfully created", data: filter });

  } catch (err) {
    res.status(500).send({ msg: err.message })
  }
}

//---------------login user ----------------------

const loginUser = async function (req, res) {
  try {

    const requestBody = req.body;

    //-----------validating request body----------

    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login credentials",
      });
    }

    //-----------destructuring--------------------

    let { email, password } = requestBody;

    //------------email validation-----------------
    if (!email) {
      return res.status(400).send({
        status: false,
        message: `Email is required`
      });
    }
    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message: `Provide valid email address`,
      });
    }

    //------------password validation-----------------

    if (!password) {
      return res.status(400).send({
        status: false,
        message: `Password is required`
      });
    }
    if (!validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message: "Please enter a valid password"
      });
    }

    let user = await userModel.findOne(requestBody)
    if (!user) {
      return res.status(400).send({ status: false, message: "Invalid credentials" })
    }

    //---------------- token creation--------------

    let token = jwt.sign(
      {
        UserId: user._id.toString(),
        Team: "Group 2",
        organisation: "FunctionUp"

      },
      "functionup-plutonium-blogging-Project1-secret-key", { expiresIn: '1h' }
    );

    res.send({ status: true, msg: "login successful", data: { token: token, userId: user._id , iat : Date.now() ,  expiresIn: '1h' } });

  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
};



module.exports = { createUser, loginUser }