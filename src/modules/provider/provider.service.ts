import { prisma } from "../../lib/prisma";
import { IGearPayload } from "./provider.interface";

const addGearInDB = async (payload: IGearPayload, providerId: string) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id: providerId,
    },
  });

  if (user.status !== "ACTIVE") {
    throw new Error("The account is suspended!");
  }

  const result = await prisma.gearItems.create({
    data: {
      providerId: providerId,
      ...payload,
    },
  });

  return result;
};

const updateGearInDB = async (
  gearId: string,
  payload: IGearPayload,
  providerId: string,
) => {
  const gearItems = await prisma.gearItems.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });

  if (gearItems.providerId !== providerId) {
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

const deleteGearInDB = async (gearId: string, providerId: string) => {
  const gearItems = await prisma.gearItems.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });

  if (gearItems.providerId !== providerId) {
    throw new Error("You are not the owner of this gear!");
  }

  await prisma.gearItems.delete({
    where: {
      id: gearId,
    },
  });
};

export const providerService = {
  addGearInDB,
  updateGearInDB,
  deleteGearInDB,
};
