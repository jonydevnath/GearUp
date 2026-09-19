import Stripe from "stripe";

export interface ICheckoutSessionResult {
  checkoutUrl: string | null;
  sessionId: string;
}

export type TStripeCheckoutSession = Stripe.Checkout.Session;

export interface IAuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}
