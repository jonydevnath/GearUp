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

  const { customerId: _, ...reviewData } = payload as any;

  const result = await prisma.reviews.create({
    data: {
      customerId: customerId,
      ...reviewData,
    },
  });

  return result;
};

export const reviewsService = {
  addReviewsInDB,
};
