export interface IGearPayload {
  categoryId: string;
  title: string;
  description: string;
  dailyRate: number;
  stockQuantity: number;
}

export interface IGearQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  categoryId?: string;
  categoryName?: string;
  minPrice?: string;
  maxPrice?: string;
  providerId?: string;
  isAvailable?: string;
}