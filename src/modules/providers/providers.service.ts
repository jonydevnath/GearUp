import { Prisma } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGearPayload, IGearQuery } from "./providers.interface";

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

const getProviderOrdersFromDB = async (providerId: string) => {
  return prisma.rentalOrders.findMany({
    where: {
      rentalOrderItems: {
        some: {
          GearItems: {
            providerId,
          },
        },
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      rentalOrderItems: {
        where: {
          GearItems: {
            providerId,
          },
        },
        include: {
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

const getAllGearsFilterInDB = async (query: IGearQuery) => {
  // 1. Pagination & Sorting setup
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  // Map legacy/common sort field names to exact schema property names
  let sortBy = query.sortBy || "createdAt";
  if (sortBy === "price" || sortBy === "pricePerDay") {
    sortBy = "dailyRate";
  }

  const sortOrder = query.sortOrder || "desc";

  // 2. Build Prisma dynamic AND conditions array
  const andConditions: Prisma.GearItemsWhereInput[] = [
    { isAvailable: true },
  ];

  // Partial match search across title or description
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Exact Category filter (by ID or Category Name)
  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.categoryName) {
    andConditions.push({
      category: {
        name: {
          equals: query.categoryName,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: {
        contains: query.brand,
        mode: "insensitive",
      },
    });
  }

  // Price Range Filtering (using schema's dailyRate field)
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      dailyRate: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  // Provider filter
  if (query.providerId) {
    andConditions.push({
      providerId: query.providerId,
    });
  }

  // Availability status filter
  if (query.isAvailable !== undefined) {
    andConditions[0] = {
      isAvailable: String(query.isAvailable) === "true",
    };
  }

  // Combine conditions into a single where object
  const whereConditions: Prisma.GearItemsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 3. Database Queries
  const gearItems = await prisma.gearItems.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  const totalGearCount = await prisma.gearItems.count({
    where: whereConditions,
  });

  // 4. Return Paginated Results
  return {
    data: gearItems,
    meta: {
      page: page,
      limit: limit,
      total: totalGearCount,
      totalPages: Math.ceil(totalGearCount / limit),
    },
  };
};

const getGearByIdFromDB = async (id: string) => {
  const gearItem = await prisma.gearItems.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  return gearItem;
};

export const providersService = {
  addGearInDB,
  updateGearInDB,
  deleteGearInDB,
  getProviderOrdersFromDB,
  getAllGearsFilterInDB,
  getGearByIdFromDB,
};
