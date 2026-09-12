import { prisma } from "../../lib/prisma";
import { IRentalsPayload } from "./rentals.interface";

const addRentalsInDB = async (
  customerId: string,
  payload: IRentalsPayload,
) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: { id: customerId },
  });

  if (user.status !== "ACTIVE" && user.role !== "ADMIN") {
    throw new Error("The account is suspended!");
  }

  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  const diffInTime = end.getTime() - start.getTime();
  const rentalDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  if (rentalDays <= 0) {
    throw new Error("End date must be at least 1 day after start date.");
  }

  return await prisma.$transaction(async (tx) => {
    let calculatedTotal = 0;
    const itemsToCreate = [];

    for (const item of payload.items) {
      const gear = await tx.gearItems.findUniqueOrThrow({
        where: { id: item.gearId },
      });

      if (!gear.isAvailable) {
        throw new Error(`Gear item "${gear.title}" is currently unavailable.`);
      }

      if (gear.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${gear.title}". Requested: ${item.quantity}, Available: ${gear.stockQuantity}`,
        );
      }

      const itemTotal = Number(gear.dailyRate) * rentalDays * item.quantity;
      calculatedTotal += itemTotal;

      itemsToCreate.push({
        GearItems: {
          connect: { id: item.gearId },
        },
        quantity: item.quantity,
        pricePerDay: gear.dailyRate, 
      });
    }

    const newRentalOrder = await tx.rentalOrders.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount: calculatedTotal,
        status: "PLACED",
        rentalOrderItems: {
          create: itemsToCreate,
        },
      },
      include: {
        rentalOrderItems: true,
      },
    });

    return newRentalOrder;
  });
};

export const rentalsService = {
  addRentalsInDB,
};
