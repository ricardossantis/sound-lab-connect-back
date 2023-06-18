require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = Router();

const { SECRET = "secret" } = process.env;

router.post("/signup", async (req, res) => {
  const { User } = req.context.models;
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const userData = { password: req.body.password, username: req.body.username, isApproved: false }
    const user = await User.create(userData);
    const { username } = user
    res.json({ username });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.patch("/changePassword", isLoggedIn, async (req, res) => {
  const { User } = req.context.models;
  const { username } = req.user; 
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    await User.findOneAndUpdate({ username }, { $set: { password } });
    res.json({ username });
  } catch (error) {
    res.status(400).json({ error });
  }
})

router.patch("/updateApproval", isLoggedIn, async (req, res) => {
  const { User } = req.context.models;
  const usernameToUpdate = req.body.username
  const isApproved = req.body.isApproved
  const { username } = req.user; 
  const user = await User.findOne({ username });
  try {
    if(user && !!user.isAdmin){
      const updated = await User.findOneAndUpdate({ username: usernameToUpdate }, { $set: { isApproved }}, { new: true });
      res.json({ username: updated.username, isApproved: updated.isApproved });
    } else {
      res.status(400).json({ error: 'Usuário não possui permissão' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
})

router.patch("/updateRole", isLoggedIn, async (req, res) => {
  const { User } = req.context.models;
  const isAdmin = req.body.isAdmin
  const usernameToUpdate = req.body.username
  const { username } = req.user; 
  const user = await User.findOne({ username });
  try {
    if(user && !!user.isAdmin){
      const updated = await User.findOneAndUpdate({ username: usernameToUpdate }, { $set: { isAdmin }}, { new: true });
      res.json({ username: updated.username, isAdmin: updated.isAdmin });
    } else {
      res.status(400).json({ error: 'Usuário não possui permissão' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { User } = req.context.models;
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && user.isApproved) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        const token = await jwt.sign({ username: user.username }, SECRET);
        res.json({ token });
      } else {
        res.status(400).json({ error: "Senha incorreta" });
      }
    } else {
      res.status(400).json({ error: "Usuário não existe" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;