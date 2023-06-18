require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware"); 

const router = Router();

router.post("/create", isLoggedIn, async (req, res) => {
  const { Marketplace, User } = req.context.models;
  const { name } = req.body
  const marketData = { name }
  const { username } = req.user; 
  const user = await User.findOne({ username });
  try {
    if(user && !!user.isAdmin){
      const marketplace = await Marketplace.create(marketData);
      res.json({ marketplace });
    } else {
      res.status(400).json({ error: 'Usuário não possui permissão' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
})

router.get("/all", isLoggedIn, async (req, res) => {
  const { Marketplace } = req.context.models;
  const { username } = req.user; 
  try {
    res.json(await Marketplace.find({ users: username }))
  } catch (error) {
    res.status(400).json({ error })
  }
});

module.exports = router;