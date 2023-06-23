require("dotenv").config();
const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const { addServiceToQueue } = require('../handlers/rabbitMqHandler')
const moment = require('moment')
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const YOUR_DOMAIN = 'http://localhost:5173';
const router = Router();

router.post("/create/:mkName", isLoggedIn, async (req, res) => {
  const { Service, Marketplace } = req.context.models;
  const { title, description, price } = req.body
  const { username } = req.user
  const { mkName: name } = req.params
  const now = moment().valueOf()
  const marketplace = await Marketplace.findOne({ name });
  try {
    const product = await stripe.products.create({name: `${name}-${username}-${title}`})
    const priceStripe = await stripe.prices.create({
      product: product.id,
      unit_amount: price,
      currency: 'usd',
    });
    const serviceData = { title, description, price, priceStripe, product, marketplace: name, owner: username, createAt: now }
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

router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
  const { User, Service } = req.context.models;
  const { username } = req.user
  const user = await User.findOne({ username });
  const services = await Service.find()
  const session = await stripe.checkout.sessions.create({
    line_items: services.map(service => ({
        price: service.priceStripe.id,
        quantity: 1,
    })),
    // payment_intent_data: {
    //   application_fee_amount: 60,
    //   transfer_data: {
    //     destination: user.stripeAccount.id,
    //   },
    // },
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });
  res.json({ url: session.url });
});

module.exports = router;