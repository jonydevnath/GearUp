import Stripe from "stripe";

export interface ICheckoutSessionResult {
  checkoutUrl: string | null;
  sessionId: string;
}

export type TStripeCheckoutSession = Stripe.Checkout.Session;
