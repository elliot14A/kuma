import { Schema } from 'effect'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100
export const DEFAULT_SORT_ORDER = 'desc' as const
export const MAX_SEARCH_LENGTH = 120

export const SortOrder = Schema.Literals(['asc', 'desc'])
export type SortOrder = typeof SortOrder.Type

export const Pagination = Schema.Struct({
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sortOrder: Schema.optional(SortOrder),
  search: Schema.optional(Schema.String),
  params: Schema.optional(Schema.Record(Schema.String, Schema.String)),
})
export type Pagination = typeof Pagination.Type

export const PaginationQuery = Schema.Struct({
  page: Schema.optional(Schema.NumberFromString),
  limit: Schema.optional(Schema.NumberFromString),
  sortOrder: Schema.optional(SortOrder),
  search: Schema.optional(Schema.String),
})
export type PaginationQuery = typeof PaginationQuery.Type

export interface RawPaginationInput {
  readonly page?: number | string | undefined
  readonly limit?: number | string | undefined
  readonly sortOrder?: string | undefined
  readonly sort_order?: string | undefined
  readonly search?: string | undefined
  readonly params?: Record<string, string> | undefined
  readonly [key: string]: unknown
}

export const makePagination = (input?: RawPaginationInput): Pagination => {
  if (!input) {
    return {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sortOrder: DEFAULT_SORT_ORDER,
      search: undefined,
      params: {},
    }
  }

  const {
    page: rawPage,
    limit: rawLimit,
    sortOrder: rawSortOrder,
    sort_order: rawSort_order,
    search: rawSearch,
    params: rawParams,
    ...extras
  } = input

  const parsedPage = typeof rawPage === 'string' ? Number.parseInt(rawPage, 10) : rawPage
  const parsedLimit = typeof rawLimit === 'string' ? Number.parseInt(rawLimit, 10) : rawLimit

  const page =
    parsedPage && !Number.isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : DEFAULT_PAGE
  let limit =
    parsedLimit && !Number.isNaN(parsedLimit) && parsedLimit >= 1 ? parsedLimit : DEFAULT_LIMIT
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT
  }

  const rawSort = rawSortOrder ?? rawSort_order
  const sortOrder = rawSort === 'asc' ? 'asc' : DEFAULT_SORT_ORDER
  const search = rawSearch ? rawSearch.slice(0, MAX_SEARCH_LENGTH) : undefined

  const params: Record<string, string> = { ...(rawParams ?? {}) }
  for (const [key, value] of Object.entries(extras)) {
    if (typeof value === 'string') {
      params[key] = value
    }
  }

  return {
    page,
    limit,
    sortOrder,
    search,
    params,
  }
}

export const getOffset = (p: Pagination): number => {
  const page = p.page ?? DEFAULT_PAGE
  const limit = p.limit ?? DEFAULT_LIMIT
  return (page - 1) * limit
}

export const getTotalPages = (totalItems: number, limit: number): number => {
  if (totalItems <= 0) return 1
  return Math.ceil(totalItems / limit)
}

export const hasNextPage = (page: number, totalPages: number): boolean => page < totalPages

export const hasPrevPage = (page: number): boolean => page > 1

export const PaginationResult = <T>(itemSchema: Schema.Schema<T>) =>
  Schema.Struct({
    items: Schema.Array(itemSchema),
    totalItems: Schema.Number,
    page: Schema.Number,
    limit: Schema.Number,
    totalPages: Schema.Number,
    hasNextPage: Schema.Boolean,
    hasPrevPage: Schema.Boolean,
  })

export type PaginationResult<T> = {
  readonly items: readonly T[]
  readonly totalItems: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
  readonly hasNextPage: boolean
  readonly hasPrevPage: boolean
}

export const makePaginationResult = <T>(
  items: readonly T[],
  totalItems: number,
  p: Pagination,
): PaginationResult<T> => {
  const page = p.page ?? DEFAULT_PAGE
  const limit = p.limit ?? DEFAULT_LIMIT
  const totalPages = getTotalPages(totalItems, limit)
  return {
    items,
    totalItems,
    page: p.page ?? DEFAULT_PAGE,
    limit: p.limit ?? DEFAULT_LIMIT,
    totalPages,
    hasNextPage: hasNextPage(page, totalPages),
    hasPrevPage: hasPrevPage(page),
  }
}
