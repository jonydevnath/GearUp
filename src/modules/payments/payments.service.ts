import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICheckoutSessionResult } from "./payments.interface";

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

export const paymentsService = {
  createCheckoutSessionInDB,
};
