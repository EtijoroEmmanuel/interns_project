import { Model, FilterQuery } from "mongoose";

export interface IPagination {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationQuery {
  page?: string | number;
  size?: string | number;
}

export function getPaginationParams(query: PaginationQuery): IPagination {
  const page = parseInt(String(query.page || 1));
  const size = parseInt(String(query.size || 10));
  
  return { page, size };
}

export async function paginate<T>(
  model: Model<T>,
  query: FilterQuery<T>,
  pagination: IPagination,
  sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<PaginatedResult<T>> {
  const skip = (pagination.page - 1) * pagination.size;

  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(pagination.size).sort(sortOptions),
    model.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.size,
  };
}