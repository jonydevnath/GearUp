import { prisma } from "../../lib/prisma";
import { ICategoriesPayload } from "./categories.interface";

const addCategoriesInDB = async (payload: ICategoriesPayload) => {
  const result = await prisma.categories.create({
    data: {
      ...payload,
    },
  });

  return result;
};

const updateCategoriesInDB = async (
  categoriesId: string,
  payload: ICategoriesPayload,
) => {
  const result = await prisma.categories.update({
    where: {
      id: categoriesId,
    },
    data: payload,
  });

  return result;
};

const deleteCategoriesInDB = async (categoriesId: string) => {
  await prisma.categories.delete({
    where: {
      id: categoriesId,
    },
  });
};

const getAllcategoriesInDB = async () => {
  return await prisma.categories.findMany();
};

export const categoriesService = {
  addCategoriesInDB,
  updateCategoriesInDB,
  deleteCategoriesInDB,
  getAllcategoriesInDB,
};
