export const EMPTY_PAGINATION = Object.freeze({
  total: 0,
  page: 1,
  pages: 0,
  limit: 20,
});

export const EMPTY_STATUS_SUMMARY = Object.freeze({
  pending: 0,
  done: 0,
  failed: 0,
});

export const isPlainObject = (value) => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

export const ensureArray = (value) => (Array.isArray(value) ? value : []);

export const ensureObject = (value, fallback = {}) => (isPlainObject(value) ? value : fallback);

export const ensureNullableObject = (value) => (isPlainObject(value) ? value : null);

export const ensureUserPayload = (value) => {
  const payload = ensureObject(value);
  const user = ensureNullableObject(payload.user);

  return {
    ...payload,
    user,
  };
};

export const ensurePaginatedResult = (value) => {
  const payload = ensureObject(value);
  const summary = ensureObject(payload.summary);

  return {
    ...payload,
    data: ensureArray(payload.data),
    pagination: ensureObject(payload.pagination, EMPTY_PAGINATION),
    summary: {
      ...summary,
      statusCounts: ensureObject(summary.statusCounts, EMPTY_STATUS_SUMMARY),
    },
  };
};
