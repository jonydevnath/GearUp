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

export const providerService = {
  addGearInDB,
};
