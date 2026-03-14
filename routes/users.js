var express = require("express");
var router = express.Router();
let { postUserValidator, validateResult } = require('../utils/validatorHandler')
let userController = require('../controllers/users')



let userModel = require("../schemas/users");
//- Strong password

router.get("/", async function (req, res, next) {
  let users = await userModel
    .find({ isDeleted: false })
    .populate({
      'path': 'role',
      'select': "name"
    })
  res.send(users);
});

router.get("/:id", async function (req, res, next) {
  try {
    let result = await userModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate({
        path: 'role',
        select: 'name'
      });
    if (result) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

router.post("/", postUserValidator, validateResult,
  async function (req, res, next) {
    try {
      let newItem = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.role,
        req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
        req.body.fullName || "",
        req.body.status || false,
        req.body.loginCount || 0
      )
      // populate cho đẹp
      let saved = await userModel
        .findById(newItem._id)
        .populate({
          path: 'role',
          select: 'name'
        });
      res.send(saved);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

router.put("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findById(id);
    for (const key of Object.keys(req.body)) {
      updatedItem[key] = req.body[key];
    }
    await updatedItem.save();

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
      .populate({
        path: 'role',
        select: 'name'
      });
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;