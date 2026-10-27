const paginate = async (prismaModel, args = {}, page = 1, limit = 10) => {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.max(1, parseInt(limit) || 10);
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

module.exports = { paginate };
