const route = require("express").Router();
const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt")

route.post("/user", async (req, res) => {
  try {
    const password = await req.body.password
    const hashedPassword = await bcrypt.hash(password, 10)
      const tempUser = { name: req.body.name, password: hashedPassword, role: req.body.role }
    const user = await userModel.create(tempUser);
    if (!user) return res.status(400).send("Can't create user");
    res.send(true);
  } catch (err) {
      res.status(500).send(err);
  }
});
route
  .put("/user", async (req, res) => {
    try {
    const {_id, name, password, role} = req.body
      const user = await userModel.findByIdAndUpdate(_id, req.body);
    if (!user) return res.status(400).send("User doesn't exist");
    res.send("Updated user");
    } catch (err) {
      res.status(500).send(err);
    }
  })
  .post("/", async (req, res) => {
    try {
      const password = await req.body.password
      const hashedPassword = await bcrypt.hash(password, 10)
      const tempUser = { name: req.body.name, password: hashedPassword, role: req.body.role }
    const user = await userModel.findOne(tempUser);
      if (!user) return res.status(400).send("Incorrect email or password");
      res.cookie = { 'user': user }
      res.send(true)
    } catch (err) {
      res.status(500).send(err);
    }
  })
  .get("/", async (req, res) => {
    try {
    const users = await userModel.find()
      if (!users) return res.status(400).send("No users");
      res.send(users)
    } catch (err) {
      res.status(500).send(err);
    }

  });

module.exports = route;