// integração do stripe com o browser/front end -> adicionar outra biblioteca stripe => yarn add @stripe/stripe-js
import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  return stripeJs;
}
