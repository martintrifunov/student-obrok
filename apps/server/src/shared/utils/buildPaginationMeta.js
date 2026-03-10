export const buildPaginationMeta = ({ total, page, limit }) => {
  if (limit === 0) return null;
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
