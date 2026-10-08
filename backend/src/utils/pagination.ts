export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function resolvePagination(query: PaginationQuery): {
  page: number;
  limit: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildMeta(page: number, limit: number, total: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
