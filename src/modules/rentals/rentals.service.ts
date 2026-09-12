import { orderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRentalsPayload } from "./rentals.interface";

const addRentalsInDB = async (customerId: string, payload: IRentalsPayload) => {
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

const updateRentalStatusInDB = async (
  rentalId: string,
  newStatus: orderStatus,
  user: { id: string; role: string },
) => {
  const rentalOrder = await prisma.rentalOrders.findUniqueOrThrow({
    where: { id: rentalId },
    include: {
      rentalOrderItems: true,
    },
  });

  const currentStatus = rentalOrder.status;

  // Terminal states cannot be changed
  if (currentStatus === "RETURNED" || currentStatus === "CANCELLED") {
    throw new Error(
      `Cannot change status of an order that is already ${currentStatus}.`,
    );
  }

  if (currentStatus === newStatus) {
    throw new Error(`Order is already in ${newStatus} status.`);
  }

  return await prisma.$transaction(async (tx) => {
    // Deduct inventory stock
    if (newStatus === "CONFIRMED" && currentStatus === "PLACED") {
      
      for (const item of rentalOrder.rentalOrderItems) {
      
        const gear = await tx.gearItems.findUniqueOrThrow({
          where: { id: item.GearItemsId },
        });

        if (gear.stockQuantity < item.quantity) {
          throw new Error(
            `Cannot confirm order. Insufficient stock for "${gear.title}".`,
          );
        }

        await tx.gearItems.update({
          where: { id: item.GearItemsId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Restock gear if cancelled AFTER stock was already reserved (CONFIRMED, PAID, PICKED_UP)
    const activeStockStatuses: orderStatus[] = [
      "CONFIRMED",
      "PAID",
      "PICKED_UP",
    ];

    if (
      newStatus === "CANCELLED" &&
      activeStockStatuses.includes(currentStatus)
    ) {
      for (const item of rentalOrder.rentalOrderItems) {
        await tx.gearItems.update({
          where: { id: item.GearItemsId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // RETURNED (Restock items upon return)
    if (newStatus === "RETURNED" && currentStatus === "PICKED_UP") {
      for (const item of rentalOrder.rentalOrderItems) {
        await tx.gearItems.update({
          where: { id: item.GearItemsId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Update order status in DB
    const updatedOrder = await tx.rentalOrders.update({
      where: { id: rentalId },
      data: { status: newStatus },
      include: {
        rentalOrderItems: true,
      },
    });

    return updatedOrder;
  });
};

export const rentalsService = {
  addRentalsInDB,
  updateRentalStatusInDB,
};
