require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const rabbitMQHandler = require('../connection/rabbitMq')

const router = Router();

router.post("/create/:mkName", isLoggedIn, async (req, res) => {
  const { Service, Marketplace } = req.context.models;
  const { title, description, price } = req.body
  const { mkName: name } = req.params
  const serviceData = { title, description, price }
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

const addServiceToQueue = (mkName, service) => {
  rabbitMQHandler((connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw new Error(err)
      }
      const msg = JSON.stringify(service);

      channel.publish(mkName, '', new Buffer(msg), {persistent: true})

      channel.close(() => {connection.close()})
    })
  })
}

module.exports = router;