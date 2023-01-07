const authModel = require("../models/authorModel");
const validation = require("../validation/validation");
const jwt = require("jsonwebtoken");

//============= *Author Creation* ================

const createrAuthor = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please enter in Body" });
    }
    if (!data.fname) {
      return res.status(400).send({ status: false, msg: "fname  is missing" });
    }
    if (!validation.isValidName(data.fname.trim())) {
      return res
        .status(400)
        .send({ status: false, msg: "fname must contains Alphabets" });
    }
    if (!data.lname) {
      return res.status(400).send({ status: false, msg: "lname is missing" });
    }
    if (!validation.isValidName(data.lname.trim())) {
      return res
        .status(400)
        .send({ status: false, msg: "lname must contains Alphabets" });
    }
    if (!data.title) {
      return res.status(400).send({ status: false, msg: "title is missing" });
    }
    if (data.title != "Mr" && data.title != "Mrs" && data.title != "Miss") {
      return res
        .status(400)
        .send({ status: false, msg: "title must be 'Mr' OR 'Mrs' OR 'Miss'" });
    }
    if (!data.email) {
      return res.status(400).send({ status: false, msg: "email is missing" });
    }
    if (!data.password) {
      return res
        .status(400)
        .send({ status: false, msg: "password is missing" });
    }
    if (!validation.isValidateEmail(data.email)) {
      return res
        .status(400)
        .send({ status: false, msg: "Enter valid Email-Id" });
    }
    const { email } = req.body;
    const isEmailAlredyUsed = await authModel.findOne({ email });
    if (isEmailAlredyUsed) {
      return res.status(400).send({
        status: false,
        msg: `${email} email address is alread registered`,
      });
    }
    if (!validation.passwordVal(data.password)) {
      return res.status(400).send({
        status: false,
        msg: "password at least 1 lowercase, at least 1 uppercase,contain at least 1 numeric character, at least one special character, range between 8-12",
      });
    }
    let createdData = await authModel.create(data);
    res.status(201).send({ status: true, data: createdData });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//============= *Author Login* ================

const login = async function (req, res) {
  try {
    let {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).send({ status: false, msg: "Email or password is required" });
    }
    console.log(req.body);
    let author = await authModel.findOne({ email, password });
    console.log(author);
    if (!author) {
      return res
        .status(404)
        .send({ status: false, msg: "author doesn't exist" });
    }
    let token = jwt.sign(
      { authorid: author._id, email: author.email },
      "thisIsASecretKeyOfAPNAgroup"
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({
      status: true,
      data: { token: token },
      msg: "successfully loggedIn",
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.createrAuthor = createrAuthor;
module.exports.login = login;
