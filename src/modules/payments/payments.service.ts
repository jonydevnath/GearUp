import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import {
  IAuthUser,
  ICheckoutSessionResult,
  TStripeCheckoutSession,
} from "./payments.interface";

const createCheckoutSessionInDB = async (
  rentalOrderId: string,
  userId: string,
): Promise<ICheckoutSessionResult> => {
  if (!rentalOrderId) {
    throw new Error("rentalOrderId is required");
  }

  const order = await prisma.rentalOrders.findUnique({
    where: { id: rentalOrderId },
    include: {
      rentalOrderItems: {
        include: {
          GearItems: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  if (order.customerId !== userId) {
    throw new Error("Unauthorized order access");
  }

  if (order.status === "PAID") {
    throw new Error("Order is already paid");
  }

  if (order.status === "CANCELLED") {
    throw new Error("Cannot pay for a cancelled order");
  }

  if (order.status === "RETURNED" || order.status === "PICKED_UP") {
    throw new Error("This order is no longer eligible for payment");
  }

  const start = new Date(order.startDate).getTime();
  const end = new Date(order.endDate).getTime();
  const rentalDays = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
  );

  const lineItems = order.rentalOrderItems.map((item) => {
    const totalItemPricePerUnit = Number(item.pricePerDay) * rentalDays;
    const priceInCents = Math.round(totalItemPricePerUnit * 100);

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.GearItems.title,
          description: `${item.GearItems.description ?? "Gear rental"} (${rentalDays} day${rentalDays > 1 ? "s" : ""})`,
        },
        unit_amount: priceInCents,
      },
      quantity: item.quantity,
    };
  });

  const baseUrl = config.app_url?.startsWith("http")
    ? config.app_url
    : `http://${config.app_url || "localhost:3000"}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    client_reference_id: order.id,
    metadata: {
      rentalOrderId: order.id,
      customerId: userId,
    },
    success_url: `${baseUrl}/payment?success=true&order_id=${order.id}`,
    cancel_url: `${baseUrl}/payment?cancel=true&order_id=${order.id}`,
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const handleCheckoutSessionCompleted = async (
  session: TStripeCheckoutSession,
) => {
  const rentalOrderId =
    session.metadata?.rentalOrderId || session.client_reference_id;

  if (!rentalOrderId) {
    throw new Error("Missing rentalOrderId on Stripe checkout session");
  }

  const order = await prisma.rentalOrders.findUnique({
    where: { id: rentalOrderId },
  });

  if (!order) {
    throw new Error("Rental order not found for completed checkout session");
  }

  if (order.status === "PAID") {
    return { alreadyProcessed: true, rentalOrderId };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const transactionId = paymentIntentId || session.id;
  const amountInDollars = (session.amount_total ?? 0) / 100;
  const paymentMethod = session.payment_method_types?.[0] || "card";

  await prisma.$transaction(async (tx) => {
    await tx.rentalOrders.update({
      where: { id: rentalOrderId },
      data: { status: "PAID" },
    });

    await tx.payments.upsert({
      where: { rentalOrderId },
      update: {
        transactionId,
        amount: amountInDollars,
        paymentMethod,
        status: "COMPLETED",
        paidAt: new Date(),
      },
      create: {
        rentalOrderId,
        transactionId,
        amount: amountInDollars,
        paymentMethod,
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });
  });

  return { alreadyProcessed: false, rentalOrderId };
};

const confirmCheckoutSessionInDB = async (
  sessionId: string,
  userId: string,
) => {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== "complete" || session.payment_status !== "paid") {
    throw new Error("Payment has not been completed");
  }

  if (session.metadata?.customerId !== userId) {
    throw new Error("Unauthorized payment confirmation");
  }

  return handleCheckoutSessionCompleted(session);
};

const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string | string[] | undefined,
) => {
  if (!signature) {
    throw new Error("Missing Stripe signature header");
  }

  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    config.stripe_webhook_secret,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session);
  }

  return { received: true, type: event.type };
};

const getPaymentsFromDB = async (user: IAuthUser) => {
  if (user.role === "ADMIN") {
    return prisma.payments.findMany({
      include: {
        rentalOrder: {
          select: {
            id: true,
            customerId: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.payments.findMany({
    where: {
      rentalOrder: {
        customerId: user.id,
      },
    },
    include: {
      rentalOrder: {
        select: {
          id: true,
          customerId: true,
          startDate: true,
          endDate: true,
          totalAmount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentByRentalOrderIdFromDB = async (
  rentalOrderId: string,
  user: IAuthUser,
) => {
  if (!rentalOrderId) {
    throw new Error("rentalOrderId is required");
  }

  const payment = await prisma.payments.findUnique({
    where: { rentalOrderId },
    include: {
      rentalOrder: {
        include: {
          rentalOrderItems: {
            include: {
              GearItems: {
                select: {
                  id: true,
                  title: true,
                  providerId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found for this rental order");
  }

  if (user.role === "ADMIN") {
    return payment;
  }

  if (user.role === "CUSTOMER") {
    if (payment.rentalOrder.customerId !== user.id) {
      throw new Error("Unauthorized payment access");
    }
    return payment;
  }

  const ownsGearOnOrder = payment.rentalOrder.rentalOrderItems.some(
    (item) => item.GearItems.providerId === user.id,
  );

  if (!ownsGearOnOrder) {
    throw new Error("Unauthorized payment access");
  }

  return payment;
};

export const paymentsService = {
  createCheckoutSessionInDB,
  confirmCheckoutSessionInDB,
  handleStripeWebhook,
  getPaymentsFromDB,
  getPaymentByRentalOrderIdFromDB,
};
