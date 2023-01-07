const mongoose = require("mongoose");
const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

//============= *Blog Creation* ================

const blogUser = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Enter Data in Body" });
    }
    if (!data.title) {
      return res.status(400).send({ status: false, msg: "title is missing" });
    }
    if (!data.body) {
      return res.status(400).send({ status: false, msg: "body is missing" });
    }
    if (!data.authorId) {
      return res
        .status(400)
        .send({ status: false, msg: "autherId is missing" });
    }
    if (!data.category) {
      return res
        .status(400)
        .send({ status: false, msg: "category is missing" });
    }
    let authorIdIsValid = await authorModel.findOne({ _id: data.authorId });
    if (!authorIdIsValid) {
      return res
        .status(400)
        .send({ status: false, msg: "Enter a valid author id" });
    }
    let savedData = await blogModel.create(data);
    res.status(201).send({ status: true, data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//============= *Get Blog Which isDeleted false & iSPublished true* ================

  const getBlogs = async function (req, res) {
 try {

    let { authorId, category, tags, subcategory } = req.query;
    if(Object.keys(req.query).length == 0){
      return res.status(400).send({msg : "Querry is Required"})
    }
    let filter = { isDeleted: false, isPublished: true }
    if (authorId) { filter.authorId = authorId }
    if (category) { filter.category = category }
    if (tags) { filter.tags = tags }
    if (subcategory) { filter.subcategory = subcategory }
    let savedData = await blogModel.find(filter)
    if (savedData.length == 0) {
        return res.status(404).send({ status: false, msg: "Such Blogs Not Available" })
    } else {
        return res.status(200).send({ status: true, data: savedData })
    }
} catch (err) {
    res.status(500).send({ status: false, msg: err.message })
}
};

//============= *Update Blog which isDelated false* ================

const updateBlog = async function (req, res) {
  try {
    const data = req.body;
    const blogId = req.params.blogId;
    const deletedData = await blogModel.findById(blogId);
    if (deletedData.isDeleted == true) {
      return res
        .status(200)
        .send({ status: false, msg: "blog already deleted" });
    }
    const updatedBlogData = await blogModel.findOneAndUpdate(
      { _id: blogId },
      {
        $set: {
          title: data.title,
          body: data.body,
          isPublished: true,
          publishedAt: new Date(),
        },
        $push: { tags: data.tags, subcategory: data.subcategory },
      },
      { new: true }
    );

    res.status(200).send({ status: true, data: updatedBlogData });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//============= *Delete/update Blog Which isDeleted false via path params* ================

const deleteParam = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    const deletedData = await blogModel.findById(blogId);
    if (deletedData.isDeleted == true) {
      return res
        .status(200)
        .send({ status: false, msg: "blog already deleted" });
    }
    let deletedBlog = await blogModel.findOneAndUpdate(
      { _id: blogId },
      { $set: { isDeleted: true }, deletedAt: new Date() },
      { new: true }
    );
    res.status(200).send({ status: true, data: deletedBlog });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//============= *Delete/update Blog Which isDeleted false via query params* ================

const deleteQuery = async function (req, res) {
  try {
    let data = req.query;
    if (Object.keys(data).length == 0){
      return res.status(400).send({ status: false, msg: "Querry required" });
    }
    const decodedToken = req.decodedToken.authorid;
    const blogData = await blogModel.findOne(data);
    if (!blogData) {
      return res
        .status(200)
        .send({ status: false, msg: "Blog does not exist" });
    }
    if (blogData.authorId.toString() !== decodedToken.toString()) {
      return res
        .status(401)
        .send({
          status: false,
          msg: "You are not allowed to modify other's data",
        });
    }
    if (blogData.isDeleted == true) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog is already deleted" });
    }
    const save = await blogModel.findOneAndUpdate(
      data,
      { $set: { isDeleted: true }, deletedAt: new Date() },
      { new: true }
    );
    res.status(200).send({ status: true, data: save });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.blogUser = blogUser;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteParam = deleteParam;
module.exports.deleteQuery = deleteQuery;
