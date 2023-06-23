require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const { addServiceToQueue } = require('../handlers/rabbitMqHandler')
const moment = require('moment')
const router = Router();

router.post("/create/:mkName", isLoggedIn, async (req, res) => {
  const { Service, Marketplace } = req.context.models;
  const { title, description, price } = req.body
  const { username } = req.user
  const { mkName: name } = req.params
  const now = moment().valueOf()
  const serviceData = { title, description, price, marketplace: name, owner: username, createAt: now }
  const marketplace = await Marketplace.findOne({ name });
  try {
    const service = await Service.create(serviceData);
    const mkPayload = { services: [...new Set([...marketplace.services, service.id])]}
    await Marketplace.findOneAndUpdate({name}, {$set: mkPayload}, { new: true })
    await addServiceToQueue(name, service)
    res.json({ service });
  } catch (error) {
    res.status(400).json({ error });
  }
})

router.get("/allFromUser", isLoggedIn, async (req, res) => {
  const { Service } = req.context.models;
  const { username } = req.user;
  try {
    res.json(await Service.find({ owner: username }))
  } catch (error) {
    res.status(400).json({ error })
  }
});

module.exports = router;