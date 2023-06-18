require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware"); 

const router = Router();

router.post("/create", isLoggedIn, async (req, res) => {
  const { Service } = req.context.models;
  const { title, description, price } = req.body
  const serviceData = { title, description, price }
  const { username } = req.user; 
  const user = await User.findOne({ username });
  try {
    if(user && !!user.isAdmin){
      const service = await Service.create(serviceData);
      res.json({ marketplace });
    } else {
      res.status(400).json({ error: 'Usuário não possui permissão' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
})

module.exports = router;