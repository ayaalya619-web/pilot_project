export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const paginate = async <T>(
  prismaModel: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  args: any = {},
  page: string | number | undefined = 1,
  limit: string | number | undefined = 10
): Promise<PaginatedResult<T>> => {
  const currentPage = Math.max(1, parseInt(page as string) || 1);
  const itemsPerPage = Math.max(1, parseInt(limit as string) || 10);
  const skip = (currentPage - 1) * itemsPerPage;

  const { where, include, orderBy, select, ...otherOptions } = args;

  const [data, totalItems] = await Promise.all([
    prismaModel.findMany({
      where,
      include,
      select,
      orderBy,
      skip,
      take: itemsPerPage,
      ...otherOptions,
    }),
    prismaModel.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage,
      limit: itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};
