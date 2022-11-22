const mongoose = require("mongoose");

const isValidName = function (value) {
  if (
    typeof value === "string" &&
    value.trim().length > 0 &&
    /^[A-Z]+[a-zA-Z0-9 ]*$/.test(value)
  )
    return true;
  return false;
};
const isValid = function (value) {
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};
const isValidPassword = function (value) {
  if (
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(value)
  )
    return true;
  return false;
};
const isValidMobile = function (mobile) {
    if (
        /^[0-9]{10}$/.test(mobile)
    ) return true;
    return false;
};
const isValidEmail = function (value) {
  if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value)) return true;
  return false;
};

const isValidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].includes(title);
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
  return mongoose.isValidObjectId(objectId);
};

const isStringsArray = function (arr) {
  if (!Array.isArray(arr)) return false;
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string" || arr[i].trim().length === 0) return false;
  }
  return true;
};

const isValidPincode = function(data){
    if (
        /^[0-9]{6}$/.test(data)
    ) return true;
    return false;
}
const isValidStreet = function(data){
  if (
    /^[a-zA-Z0-9\s,.' ]{3,}$/.test(data)
) return true;
return false;
}

const isValidCity = function (value) {
  if (
    typeof value === "string" &&
    value.trim().length > 0 &&
    /^[a-zA-Z ]*$/.test(value)
  )
    return true;
  return false;
};
const validISBN= function (value) {
  if ((value.match(/^(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]$/)) )return true;
  return false;
}

const isNumber=function(value){
  if(typeof value==="Number")
  return true
  return false
}

const isValidDate = function(date){
  if (!/^(18|19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) return false
  return true;
}

const isNotEmpty = function (value) {
  if (value.trim().length != 0) return true;
  return false;
}

const isValidRating = function(rating){
  if (
    /^[1-5]{1}$/.test(rating)
) return true;
return false;
}
const isWrong = function (value) {
  if (value.match(/^[a-zA-Z0-9, ]*$/)) return true;
  return false;
}

const isValidReviewer=function(reviewedBy){
  if (/^[a-zA-Z,\-.\s]*$/.match(reviewedBy)) return  true
  return false;
  }

module.exports = {
  isValid,
  isValidTitle,
  isValidRequestBody,
  isValidObjectId,
  isValidPassword,
  isValidEmail,
  isStringsArray,
  isValidName,
  isValidMobile,
  isValidPincode,
  validISBN,
  isNumber,
  isValidDate,
  isNotEmpty,
  isWrong,
  isValidRating,
  isValidReviewer,
  isValidStreet,
  isValidCity
};