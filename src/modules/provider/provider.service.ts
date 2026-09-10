import { prisma } from "../../lib/prisma";
import { IAddGearPayload } from "./provider.interface";

const addGearInDB = async (payload: IAddGearPayload, userId: string) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  if (user.status !== "ACTIVE") {
    throw new Error("The account is suspended!");
  }

  const result = await prisma.gearItems.create({
    data: {
      providerId: userId,
      ...payload,
    },
  });

  return result;
};

const updateGearInDB = async (
  gearId: string,
  payload: IAddGearPayload,
  userId: string,
) => {
  const gearItems = await prisma.gearItems.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });

  if (gearItems.providerId !== userId) {
    throw new Error("You are not the owner of this gear!");
  }

  const result = await prisma.gearItems.update({
    where: {
      id: gearId,
    },
    data: payload,
  });

  return result;
};

export const providerService = {
  addGearInDB,
  updateGearInDB,
};
