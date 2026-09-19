import { prisma } from "../../lib/prisma";
import { IReviewPayload } from "./reviews.interface";

const addReviewsInDB = async (customerId: string, payload: IReviewPayload) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id: customerId,
    },
  });

  if (user.status !== "ACTIVE") {
    throw new Error("The account is suspended!");
  }

  const { gearItemsId, rentalOrderId, rating, comment } = payload;

  if (!gearItemsId || !rentalOrderId) {
    throw new Error("gearItemsId and rentalOrderId are required");
  }

  const rentalOrder = await prisma.rentalOrders.findUnique({
    where: { id: rentalOrderId },
    select: {
      customerId: true,
      status: true,
      rentalOrderItems: {
        select: {
          GearItemsId: true,
        },
      },
    },
  });

  if (!rentalOrder) {
    throw new Error("Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You are not authorized to review this rental order");
  }

  if (rentalOrder.status !== "RETURNED") {
    throw new Error("You can only review gear after it has been returned");
  }

  const rentedGear = rentalOrder.rentalOrderItems.some(
    (item) => item.GearItemsId === gearItemsId,
  );

  if (!rentedGear) {
    throw new Error("This gear item was not included in the rental order");
  }

  const result = await prisma.reviews.create({
    data: {
      customerId: customerId,
      gearItemsId,
      rentalOrderId,
      rating,
      comment,
    },
  });

  return result;
};

export const reviewsService = {
  addReviewsInDB,
};
