import { userStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUserFromDB = async () => {
  const allUsers = await prisma.users.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return allUsers;
};

const updateUsersStatusInDB = async (userId: string, status: userStatus) => {
  const result = await prisma.users.update({
    where: {
      id: userId,
    },
    data: {
      status: status,
    },
  });

  return result;
};

const getAllGearsInDB = async () => {
  return await prisma.gearItems.findMany();
};

const getAllRentalsInDB = async () => {
  return await prisma.rentalOrders.findMany({
    select: {
      id: true,
      customerId: true,
      startDate: true,
      endDate: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      rentalOrderItems: {
        select: {
          quantity: true,
          pricePerDay: true,
          GearItems: {
            select: {
              id: true,
              title: true,
              description: true,
              providerId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const adminService = {
  getAllUserFromDB,
  updateUsersStatusInDB,
  getAllGearsInDB,
  getAllRentalsInDB,
};
