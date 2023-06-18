// require("dotenv").config();
// const { Router } = require("express");
// const { isLoggedIn } = require("./middleware");
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const { promisify } = require('util');
const Joi = require('joi');

const router = express.Router();
const redisClient = redis.createClient();

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);

const { SECRET = 'secret' } = process.env;

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// create signupSchema to validate user data
const signupSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required(),
    name: Joi.string().required()
})

router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { username, password } = req.body;
    const cachedUser = await redisGetAsync(username);
    const user = JSON.parse(cachedUser);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ username: user.username }, SECRET);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    const password = await bcrypt.hash(req.body.password, 10);
    const userData = { password, username: req.body.username, isApproved: false };
    const usernameExists = await redisGetAsync("users", req.body.username);
    if (usernameExists) {
      return res.status(400).json({ error: "Username already exists" });
    }
    await redisSetAsync("users", req.body.username, JSON.stringify(userData));
    res.json({ username: req.body.username });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// router.patch("/changePassword", isLoggedIn, async (req, res) => {
//   const { redisClient } = req.context;
//   const { username } = req.user;
//   try {
//     const { error } = changePasswordSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }
//     const password = await bcrypt.hash(req.body.password, 10);
//     const userData = await redisClient.hget("users", username);
//     if (!userData) {
//       return res.status(400).json({ error: "User not found" });
//     }
//     const user = JSON.parse(userData);
//     user.password = password;
//     await redisClient.hset("users", username, JSON.stringify(user));
//     res.json({ username });
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });

// router.patch("/updateApproval", isLoggedIn, async (req, res) => {
//   const { redisClient } = req.context;
//   const { username } = req.user;
//   try {
//     const { error } = updateApprovalSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }
//     const userData = await redisClient.hget("users", username);
//     if (!userData) {
//       return res.status(400).json({ error: "User not found" });
//     }
//     const user = JSON.parse(userData);
//     if (!user.isAdmin) {
//       return res.status(400).json({ error: "User does not have permission" });
//     }
//     const { username: usernameToUpdate, isApproved } = req.body;
//     const userDataToUpdate = await redisClient.hget("users", usernameToUpdate);
//     if (!userDataToUpdate) {
//       return res.status(400).json({ error: "User to update not found" });
//     }
//     const userToUpdate = JSON.parse(userDataToUpdate);
//     userToUpdate.isApproved = isApproved;
//     await redisClient.hset("users", usernameToUpdate, JSON.stringify(userToUpdate));
//     res.json({ username: userToUpdate.username, isApproved: userToUpdate.isApproved });
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });

// const { updateRoleSchema } = require("../schemas");

// router.patch("/updateRole", isLoggedIn, async (req, res) => {
//   const { redisClient } = req.context;
//   const { username } = req.user;
//   const { error } = updateRoleSchema.validate(req.body);
//
//   if (error) {
//     return res.status(400).json({ error: error.details[0].message });
//   }
//
//   const { username: usernameToUpdate, isAdmin } = req.body;
//
//   try {
//     const user = await redisClient.hgetall(`user:${username}`);
//     if (!user || user.isAdmin !== "true") {
//       return res.status(400).json({ error: "Usuário não possui permissão" });
//     }
//
//     await redisClient.hmset(`user:${usernameToUpdate}`, "isAdmin", isAdmin);
//
//     res.json({ username: usernameToUpdate, isAdmin });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


module.exports = router;