
const groupBy = <T, K extends keyof T>(
  key: K,
  toGroupKey: (value: T[K]) => string,
) => (arr: T[]): Record<string, T[]> => {
  return arr.reduce((acc: Record<string, T[]>, value: T): Record<string, T[]> => {
    const groupKey = toGroupKey(value[key]);
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(value);
    return acc;
  }, {});
};

export default groupBy;
