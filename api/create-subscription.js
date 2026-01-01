import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { paymentMethodId, email } = req.body;

    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: "price_1Sih3YELCSEmD9SiaiKG67Kv", // <-- replace this
        },
      ],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({
      clientSecret:
        subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
