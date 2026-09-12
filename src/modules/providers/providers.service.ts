import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGearPayload } from "./providers.interface";

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
  payload: Partial<IGearPayload>,
  user: { id: string; role: Role },
) => {
  const gearItem = await prisma.gearItems.findUniqueOrThrow({
    where: { id: gearId },
  });

  const isOwner = gearItem.providerId === user.id;
  const isAdmin = user.role === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error("You are not authorized to update this gear!");
  }

  const result = await prisma.gearItems.update({
    where: { id: gearId },
    data: payload,
  });

  return result;
};

const deleteGearInDB = async (
  gearId: string,
  user: { id: string; role: Role },
) => {
  const gearItem = await prisma.gearItems.findUniqueOrThrow({
    where: { id: gearId },
  });

  const isOwner = gearItem.providerId === user.id;
  const isAdmin = user.role === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error("You are not authorized to delete this gear!");
  }

  const result = await prisma.gearItems.update({
    where: { id: gearId },
    data: { isAvailable: false },
  });

  return result;
};

export const providersService = {
  addGearInDB,
  updateGearInDB,
  deleteGearInDB,
};
