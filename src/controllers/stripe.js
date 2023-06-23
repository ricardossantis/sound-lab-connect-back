require("dotenv").config();
const { Router } = require("express");
const {isLoggedIn} = require("./middleware");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const router = Router();

const YOUR_DOMAIN = 'http://localhost:5173';

router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
  const { User } = req.context.models;
  const { price } = req.body
  const { username } = req.user
  const user = await User.findOne({ username });
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: 60,
      transfer_data: {
        destination: user.stripeAccount.id,
      },
    },
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });
  res.redirect(303, session.url);
});